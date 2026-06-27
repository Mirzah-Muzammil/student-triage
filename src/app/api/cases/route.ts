import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // filter by status if provided
  const includeSpam = searchParams.get("include_spam") === "true";

  const where: Prisma.RequestWhereInput = {
    disposition: {
      in: includeSpam ? ["escalate", "spam"] : ["escalate"],
    },
  };
  if (status) where.status = status;

  const cases = await prisma.request.findMany({
    where,
    orderBy: [
      // Safeguarding first, then by urgency severity, then newest
      { safeguarding: "desc" },
      { createdAt: "desc" },
    ],
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
      abuseFlag: true,
    },
  });

  // Sort by urgency weight server-side (Prisma can't do enum-based sort natively)
  const urgencyWeight: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  cases.sort((a, b) => {
    if (a.safeguarding !== b.safeguarding)
      return a.safeguarding ? -1 : 1;
    return (urgencyWeight[a.urgency] ?? 4) - (urgencyWeight[b.urgency] ?? 4);
  });

  return NextResponse.json(cases);
}
