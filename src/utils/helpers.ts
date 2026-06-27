import { Case } from "@/features/cases/types";

export const urgencyWeight: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function formatDate(dateStr: string | Date): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

export function formatDateTime(dateStr: string | Date): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

export function sortCasesByPriority(cases: Case[]): Case[] {
  return [...cases].sort((a, b) => {
    if (a.safeguarding !== b.safeguarding) {
      return a.safeguarding ? -1 : 1;
    }

    const urgencyDelta =
      (urgencyWeight[b.urgency] ?? 0) - (urgencyWeight[a.urgency] ?? 0);

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function sortCases(cases: Case[], sortField: string, sortAsc: boolean): Case[] {
  if (sortField === "importance") {
    return sortCasesByPriority(cases);
  }

  return [...cases].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "urgency") {
      comparison = (urgencyWeight[a.urgency] ?? 0) - (urgencyWeight[b.urgency] ?? 0);
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortAsc ? comparison : -comparison;
  });
}

export const statusColorsTable: Record<string, string> = {
  new: "text-emerald-600",
  in_progress: "text-emerald-600",
  resolved: "text-rose-600",
  spam: "text-rose-600",
};

export const statusColorsModal: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const urgencyStyles: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

export function formatCategory(category: string): string {
  if (!category) return "";
  if (category === "visa_immigration") return "Visa & Immigration";
  if (category === "health_wellbeing") return "Health & Wellbeing";
  return category.charAt(0).toUpperCase() + category.slice(1);
}
