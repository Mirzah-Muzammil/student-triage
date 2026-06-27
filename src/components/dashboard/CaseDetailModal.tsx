"use client";

import { useState } from "react";
import { Case } from "@/features/cases/types";
import {
  formatCategory,
  urgencyStyles,
  statusColorsModal,
} from "@/utils/helpers";

interface CaseDetailModalProps {
  caseData: Case;
  onClose: () => void;
  onStatusChange: (
    id: string,
    status: string,
    disposition?: string,
  ) => Promise<void>;
}

export default function CaseDetailModal({
  caseData,
  onClose,
  onStatusChange,
}: CaseDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isSpam = caseData.disposition === "spam";

  async function handleStatusChange(status: string) {
    setIsUpdating(true);
    try {
      await onStatusChange(caseData.id, status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRestore() {
    setIsUpdating(true);
    try {
      await onStatusChange(caseData.id, "new", "escalate");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col max-h-[90vh]">
        {/* Banner for Special Cases */}
        {isSpam ? (
          <div
            className={`px-6 py-3 text-white font-semibold text-sm flex items-center gap-2 ${caseData.injectionFlag ? "bg-purple-600" : "bg-amber-600"}`}
          >
            <span>
              {caseData.injectionFlag
                ? "🚨 PROMPT INJECTION BLOCKED"
                : "⚠️ SPAM DETECTION"}
            </span>
          </div>
        ) : caseData.safeguarding ? (
          <div className="bg-red-600 px-6 py-3 text-white font-semibold text-sm flex items-center gap-2">
            <span>⚠️ HIGH CRISIS / SAFEGUARDING TRIGGERED</span>
          </div>
        ) : null}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Case Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">ID: {caseData.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Student Name
              </p>
              <p className="font-semibold text-slate-700 mt-1">
                {caseData.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </p>
              <p className="font-medium text-slate-700 mt-1">
                <a
                  href={`mailto:${caseData.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {caseData.email}
                </a>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                University
              </p>
              <p className="font-medium text-slate-700 mt-1">
                {caseData.university}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Course & Year
              </p>
              <p className="font-medium text-slate-700 mt-1">
                {caseData.course} ({caseData.yearOfStudy})
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date Received
              </p>
              <p className="font-medium text-slate-700 mt-1">
                {new Date(caseData.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Urgency
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${urgencyStyles[caseData.urgency] || ""}`}
                >
                  {caseData.urgency.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </p>
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-medium border border-slate-200">
                  {formatCategory(caseData.category)}
                </span>
              </div>
            </div>
          </div>

          {/* Student Message */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Original Student Message
            </p>
            <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
              {caseData.message}
            </div>
          </div>

          {/* AI Staff Summary */}
          {caseData.staffSummary && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                AI Diagnostic Summary
              </p>
              <div className="text-sm bg-blue-50/20 border border-blue-100 p-4 rounded-xl leading-relaxed whitespace-pre-line text-slate-700">
                {caseData.staffSummary}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {isSpam ? (
            <>
              <span className="text-xs text-slate-400">
                {caseData.injectionFlag
                  ? "Blocked due to malicious instruction pattern."
                  : "Blocked due to commercial advertisement pattern."}
              </span>
              <button
                onClick={handleRestore}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                <svg
                  className="h-4 w-4"
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
                Restore as Legitimate Case
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColorsModal[caseData.status] || ""}`}
                >
                  {caseData.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 mr-1">
                  Update Status:
                </span>
                <select
                  disabled={isUpdating}
                  value={caseData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
