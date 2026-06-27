"use client";

import { AiProviderStatus, Case } from "@/features/cases/types";
import { formatCategory, formatDateTime } from "@/utils/helpers";

interface DashboardOverviewProps {
  cases: Case[];
  stats: {
    total: number;
    safeguarding: number;
    urgent: number;
    spam: number;
    new: number;
    inProgress: number;
    resolved: number;
    providerStatuses?: AiProviderStatus[];
  };
}

export default function DashboardOverview({
  cases,
  stats,
}: DashboardOverviewProps) {
  // 1. Calculate Category Distributions
  const categories = [
    "academic",
    "financial",
    "visa_immigration",
    "housing",
    "health_wellbeing",
    "other",
  ];
  const categoryCounts = categories.reduce(
    (acc, cat) => {
      acc[cat] = cases.filter((c) => c.category === cat).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Category Color Map
  const categoryColors: Record<string, string> = {
    academic: "bg-blue-500",
    financial: "bg-emerald-500",
    visa_immigration: "bg-purple-500",
    housing: "bg-orange-500",
    health_wellbeing: "bg-rose-500",
    other: "bg-slate-400",
  };

  // 2. Calculate Urgency Distributions for Donut Chart
  const urgencies = ["critical", "high", "medium", "low"];
  const urgencyCounts = urgencies.reduce(
    (acc, urg) => {
      acc[urg] = cases.filter((c) => c.urgency === urg).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalUrgencyCount = cases.length;

  const urgencyColorsHex: Record<string, string> = {
    critical: "#ef4444", // Red-500
    high: "#f97316", // Orange-500
    medium: "#f59e0b", // Amber-500
    low: "#10b981", // Emerald-500
  };

  const urgencyBgMap: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };

  // Compute SVG Donut segments
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~314.159

  let accumulatedPercent = 0;
  const donutSegments = urgencies.map((urg) => {
    const count = urgencyCounts[urg] || 0;
    const percent = totalUrgencyCount > 0 ? count / totalUrgencyCount : 0;
    const strokeDasharray = `${(percent * circumference).toFixed(3)} ${(circumference - percent * circumference).toFixed(3)}`;
    const strokeDashoffset = (-accumulatedPercent * circumference).toFixed(3);
    accumulatedPercent += percent;

    return {
      urgency: urg,
      count,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      color: urgencyColorsHex[urg],
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Overview
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time triage diagnostics and student enquiries analytics.
          </p>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Cases */}
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#f0f4f8] text-blue-600 rounded-[14px] shrink-0">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Total Escalated
            </p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2 leading-none">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Card 2: Safeguarding Cases */}
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-50 text-red-600 rounded-[14px] shrink-0">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Crisis / Safeguarding
            </p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2 leading-none">
              {stats.safeguarding}
            </p>
          </div>
        </div>

        {/* Card 3: Urgent Cases */}
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-[14px] shrink-0">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              High & Critical
            </p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2 leading-none">
              {stats.urgent}
            </p>
          </div>
        </div>

        {/* Card 4: Spam Filtered */}
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-slate-50 text-slate-500 rounded-[14px] shrink-0">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Filtered Spam / Junk
            </p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2 leading-none">
              {stats.spam}
            </p>
          </div>
        </div>
      </div>

      {/* ── VISUAL CHARTS SECTION ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: Category Breakdown (Horizontal Bar Chart) */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Escalations by Category
            </h3>
            <p className="text-[11px] text-slate-400 ">
              Distribution of academic, financial, or wellbeing support
              requests.
            </p>
          </div>

          <div className=" flex flex-col gap-5">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const percentage =
                totalUrgencyCount > 0
                  ? Math.round((count / totalUrgencyCount) * 100)
                  : 0;
              const barWidth = `${(count / maxCategoryCount) * 100}%`;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{formatCategory(cat)}</span>
                    <span className="text-slate-400">
                      {count}{" "}
                      <span className="text-[10px] font-medium">
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${categoryColors[cat]} transition-all duration-500 ease-out`}
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph 2: Urgency Breakdown (Donut Chart) */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Urgency Severity
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Case classifications based on security, safeguarding, and speed of
              reply.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* SVG Donut */}
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Gray Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {totalUrgencyCount > 0 ? (
                  donutSegments.map((seg) => (
                    <circle
                      key={seg.urgency}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  ))
                ) : (
                  // Default gray indicator if no cases exist
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#cbd5e1"
                    strokeWidth={strokeWidth}
                  />
                )}
              </svg>

              {/* Center Details */}
              <div className="absolute text-center select-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Total
                </p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1 leading-none">
                  {totalUrgencyCount}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                  Cases
                </p>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-3 w-full sm:w-auto">
              {urgencies.map((urg) => {
                const count = urgencyCounts[urg] || 0;
                const percentage =
                  totalUrgencyCount > 0
                    ? Math.round((count / totalUrgencyCount) * 100)
                    : 0;

                return (
                  <div
                    key={urg}
                    className="flex items-center gap-3 text-xs font-semibold"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${urgencyBgMap[urg]}`}
                    />
                    <span className="text-slate-600 capitalize w-16">
                      {urg}
                    </span>
                    <span className="text-slate-400 font-medium ml-auto">
                      {count}{" "}
                      <span className="text-[10px]">({percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
