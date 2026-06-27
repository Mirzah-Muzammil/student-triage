"use server";

import { prisma } from "@/core/db/prisma";
import { unstable_cache, revalidateTag } from "next/cache";
import { Case } from "@/features/cases/types";
import { sortCases } from "@/utils/helpers";

export interface FetchCasesParams {
  tab?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: string;
  asc?: boolean;
  view?: "escalations" | "spam";
  urgency?: string;
}

// Cache all active & spam cases from the database
export const fetchAllRawCases = unstable_cache(
  async () => {
    return prisma.request.findMany({
      where: {
        disposition: {
          in: ["escalate", "spam"],
        },
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        email: true,
        university: true,
        course: true,
        yearOfStudy: true,
        message: true,
        category: true,
        urgency: true,
        safeguarding: true,
        staffSummary: true,
        status: true,
        disposition: true,
        spamFlag: true,
        injectionFlag: true,
        aiReasoning: true,
      },
    });
  },
  ["all-raw-cases"],
  { tags: ["cases"], revalidate: 60 } // cache for 60 seconds
);

export async function getCases(params: FetchCasesParams) {
  const rawCases = await fetchAllRawCases();

  // 1. Calculate Stats based on the full cached set
  const escalatedCases = rawCases.filter((c) => c.disposition !== "spam");
  const spamCases = rawCases.filter((c) => c.disposition === "spam");

  const quotaCase = rawCases.find(
    (c) =>
      c.aiReasoning &&
      (c.aiReasoning.toLowerCase().includes("quota") ||
        c.aiReasoning.toLowerCase().includes("limit exceeded") ||
        c.aiReasoning.toLowerCase().includes("exceeded your current quota"))
  );

  const stats = {
    total: escalatedCases.length,
    safeguarding: escalatedCases.filter((c) => c.safeguarding).length,
    urgent: escalatedCases.filter((c) => c.urgency === "critical" || c.urgency === "high").length,
    spam: spamCases.length,
    new: escalatedCases.filter((c) => c.status === "new").length,
    inProgress: escalatedCases.filter((c) => c.status === "in_progress").length,
    resolved: escalatedCases.filter((c) => c.status === "resolved").length,
    injection: spamCases.filter((c) => c.injectionFlag).length,
    abusive: spamCases.filter((c) => c.spamFlag).length,
    quotaError: quotaCase ? quotaCase.aiReasoning : null,
  };

  // 2. Filter cases based on params
  const view = params.view || "escalations";
  let filtered = view === "spam" ? spamCases : escalatedCases;

  const tab = params.tab || "all";
  if (view === "spam") {
    if (tab === "prompt_injection") {
      filtered = filtered.filter((c) => c.injectionFlag);
    } else if (tab === "abusive_content") {
      filtered = filtered.filter((c) => c.spamFlag);
    }
  } else {
    if (tab !== "all") {
      filtered = filtered.filter((c) => c.status === tab);
    }
  }

  // Urgency filter
  if (params.urgency) {
    filtered = filtered.filter((c) => c.urgency === params.urgency);
  }

  // Search filter (name or email)
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }

  // Date range filters
  if (params.from) {
    const start = new Date(params.from);
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter((c) => new Date(c.createdAt) >= start);
  }
  if (params.to) {
    const end = new Date(params.to);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((c) => new Date(c.createdAt) <= end);
  }

  // Convert Date objects to string for client serialization
  const serialized = filtered.map((c) => ({
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  })) as Case[];

  // 3. Sort cases using helper
  const sorted = sortCases(serialized, params.sort || "createdAt", params.asc ?? false);

  return {
    cases: sorted,
    stats,
  };
}

export async function updateCaseStatus(id: string, update: { status?: string; disposition?: string }) {
  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: update.status,
      disposition: update.disposition,
    },
    select: {
      id: true,
      status: true,
      disposition: true,
    },
  });

  revalidateTag("cases", { expire: 0 });
  return updated;
}

export async function deleteCasePermanently(id: string) {
  const deleted = await prisma.request.delete({
    where: { id },
  });
  revalidateTag("cases", { expire: 0 });
  return deleted;
}

export async function restoreSpamCase(id: string) {
  const restored = await prisma.request.update({
    where: { id },
    data: {
      disposition: "escalate",
      status: "new",
    },
  });
  revalidateTag("cases", { expire: 0 });
  return restored;
}
