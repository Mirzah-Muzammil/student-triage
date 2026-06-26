"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  updateCaseStatus,
  deleteCasePermanently,
  restoreSpamCase,
} from "@/services/caseServices";
import CaseDetailModal from "./CaseDetailModal";
import { Case } from "@/services/types";
import {
  formatDate,
  formatCategory,
  statusColorsTable,
  urgencyStyles,
} from "@/utils/helpers";

interface DashboardTableProps {
  view: "escalations" | "spam";
  cases: Case[];
  stats: {
    total: number;
    safeguarding: number;
    urgent: number;
    spam: number;
    new: number;
    inProgress: number;
    resolved: number;
    injection: number;
    abusive: number;
  };
  currentParams: {
    tab: string;
    search: string;
    from: string;
    to: string;
    sort: string;
    asc: boolean;
    urgency: string;
  };
}

export default function DashboardTable({
  view,
  cases,
  stats,
  currentParams,
}: DashboardTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  function updateParams(newParams: Partial<typeof currentParams>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleStatusChange(
    id: string,
    status: string,
    disposition?: string,
  ) {
    try {
      await updateCaseStatus(id, { status, disposition });
      if (selectedCase && selectedCase.id === id) {
        setSelectedCase((prev) =>
          prev
            ? {
                ...prev,
                status: status,
                disposition: disposition ?? prev.disposition,
              }
            : null,
        );
      }
      router.refresh();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  }

  async function handleRestore(id: string) {
    setIsActionLoading(id);
    try {
      await restoreSpamCase(id);
      router.refresh();
    } catch (err) {
      console.error("Restore failed:", err);
    } finally {
      setIsActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to permanently delete this request? This action cannot be undone.",
      )
    ) {
      return;
    }
    setIsActionLoading(id);
    try {
      await deleteCasePermanently(id);
      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsActionLoading(null);
    }
  }

  function toggleSort(field: "name" | "createdAt" | "urgency") {
    if (currentParams.sort === field) {
      updateParams({ sort: field, asc: !currentParams.asc });
    } else {
      updateParams({ sort: field, asc: false });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          {view === "spam" ? "Junk / Spam Requests" : "Escalation Queue"}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {view === "spam"
            ? "Manage and review submissions flagged as spam or prompt injections."
            : "Review and respond to active student requests flagged for staff intervention."}
        </p>
      </div>

      {/* ── SPAM METRICS OR ALERTS HEADER ───────────────── */}
      {view === "spam" && (
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-[14px]">
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
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Auto-Discard Shield Active
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Auto-blocked <strong>{stats.spam}</strong> submissions:{" "}
                <strong>{stats.injection}</strong> prompt injections and{" "}
                <strong>{stats.abusive}</strong> abuse/commercial spam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS FILTER BAR ───────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-slate-200/60 bg-white p-1 w-fit shadow-sm">
        {view === "spam"
          ? (
              [
                ["all", "All Spam", stats.spam],
                ["prompt_injection", "Prompt Injection", stats.injection],
                ["abusive_content", "Abusive Content", stats.abusive],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                id={`filter-${value}`}
                onClick={() => updateParams({ tab: value })}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                  currentParams.tab === value
                    ? "bg-[#f0f4f8] text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {label}
                <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/50 text-slate-500 font-medium">
                  {count}
                </span>
              </button>
            ))
          : (
              [
                ["all", "All Escalations", stats.total],
                ["new", "New", stats.new],
                ["in_progress", "In Progress", stats.inProgress],
                ["resolved", "Resolved", stats.resolved],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                id={`filter-${value}`}
                onClick={() => updateParams({ tab: value })}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                  currentParams.tab === value
                    ? "bg-[#f0f4f8] text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {label}
                <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/50 text-slate-500 font-medium">
                  {count}
                </span>
              </button>
            ))}
      </div>

      {/* ── SEARCH & DATE FILTERS BAR (EchoRewards Design Alignment) ──────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const searchVal = formData.get("search") as string;
            updateParams({ search: searchVal });
          }}
          className="relative w-full md:max-w-md"
        >
          <input
            type="text"
            name="search"
            key={currentParams.search}
            defaultValue={currentParams.search}
            placeholder={
              view === "spam"
                ? "Search spam by student name or email"
                : "Search by student name or email"
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold focus:border-blue-500 focus:outline-none"
          />
        </form>

        {/* Date & Urgency Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 w-full md:w-auto justify-end">
          <span>From</span>
          <input
            type="date"
            value={currentParams.from}
            onChange={(e) => updateParams({ from: e.target.value })}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold transition-colors focus:border-blue-500 focus:outline-none"
          />
          <span>To</span>
          <input
            type="date"
            value={currentParams.to}
            onChange={(e) => updateParams({ to: e.target.value })}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold transition-colors focus:border-blue-500 focus:outline-none"
          />
          {view === "escalations" && (
            <div className="flex items-center gap-2">
              <span>Urgency</span>
              <select
                value={currentParams.urgency}
                onChange={(e) => updateParams({ urgency: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold transition-colors focus:border-blue-500 focus:outline-none capitalize"
              >
                <option value="">All Urgencies</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── DATATABLE (EchoRewards Style) ───────────────────────────────────── */}
      <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
            <thead className="bg-[#f8fafd] text-slate-400 select-none">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Student Name & Email
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                {view === "spam" ? (
                  <>
                    <th className="px-6 py-4">Snippet</th>
                    <th className="px-6 py-4">Reason</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">University</th>
                    <th className="px-6 py-4">Course & Year</th>
                  </>
                )}
                <th className="px-6 py-4">Category</th>
                {view !== "spam" && <th className="px-6 py-4">Urgency</th>}
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Date Received
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                {view !== "spam" && (
                  <th
                    onClick={() => toggleSort("urgency")}
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {cases.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <p className="text-sm font-semibold">
                      No cases match your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const isRowSpam = c.disposition === "spam";

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/50 transition-colors ${c.safeguarding && !isRowSpam ? "bg-red-50/5" : ""}`}
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {c.name}
                        </div>
                        <div className="text-slate-400 font-medium text-[11px] mt-0.5">
                          {c.email}
                        </div>
                      </td>

                      {/* View Specific Columns */}
                      {view === "spam" ? (
                        <>
                          <td className="px-6 py-4 text-slate-500 max-w-xs truncate font-medium">
                            {c.message}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            <span
                              className={`px-2 py-1 rounded-[10px] text-[10px] font-bold ${c.injectionFlag ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                            >
                              {c.injectionFlag
                                ? "Prompt Injection"
                                : "Abusive Content"}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-slate-500">
                            {c.university}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-600">
                              {c.course}
                            </div>
                            <div className="text-slate-400 font-medium text-[10px] mt-0.5">
                              {c.yearOfStudy}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-slate-500 font-semibold">
                          {formatCategory(c.category)}
                        </span>
                      </td>

                      {/* Urgency */}
                      {view !== "spam" && (
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize ${urgencyStyles[c.urgency] || ""}`}
                          >
                            {c.urgency}
                          </span>
                        </td>
                      )}

                      {/* Date Received */}
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Status (Escalations view only) */}
                      {view !== "spam" && (
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${statusColorsTable[c.status] || ""}`}
                          >
                            {c.status === "resolved" ? "Inactive" : "Active"}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {view === "spam" ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleRestore(c.id)}
                              disabled={isActionLoading !== null}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-100 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={isActionLoading !== null}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setSelectedCase(c)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
                            >
                              Details
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
