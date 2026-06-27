"use client";

import { useState, useEffect } from "react";
import { Case } from "@/features/cases/types";
import {
  formatCategory,
  formatDateTime,
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
  const [animate, setAnimate] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSpam = caseData.disposition === "spam";
  const followUps = caseData.followUps ?? [];

  useEffect(() => {
    // Trigger transition shortly after mounting
    const timer = setTimeout(() => setAnimate(true), 10);
    
    // Listen for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleClose() {
    setAnimate(false);
    // Wait for the slide-out transition to complete (300ms) before triggering onClose
    setTimeout(onClose, 300);
  }

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
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(caseData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Get initials for Avatar
  const initials = caseData.name
    ? caseData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <div
      className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Drawer Container */}
      <div
        className={`w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl transition-transform duration-300 transform border-l border-slate-100 ${
          animate ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner for Special Cases */}
        {isSpam ? (
          <div
            className={`px-6 py-3.5 text-white font-semibold text-xs tracking-wide flex items-center gap-2 shrink-0 ${
              caseData.injectionFlag ? "bg-purple-600" : caseData.abuseFlag ? "bg-rose-700" : "bg-amber-600"
            }`}
          >
            <span>
              {caseData.injectionFlag
                ? "🚨 SECURITY: PROMPT INJECTION BLOCKED"
                : caseData.abuseFlag
                ? "⛔ SECURITY: HOSTILE / ABUSIVE CONTENT BLOCKED"
                : "⚠️ WARNING: AUTOMATIC SPAM DETECTION"}
            </span>
          </div>
        ) : caseData.safeguarding ? (
          <div className="bg-red-600 px-6 py-3.5 text-white font-semibold text-xs tracking-wide flex items-center gap-2 shrink-0 animate-pulse">
            <span>🚨 CRITICAL: HIGH RISK / SAFEGUARDING ESCALATED</span>
          </div>
        ) : null}

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-0.5">
              Triage Diagnostics
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
              Case Details
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              ID: {caseData.id}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
          {/* Student Profile Hero Card */}
          <div className="bg-slate-50/70 border border-slate-200/50 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-lg border border-indigo-100 shrink-0 select-none">
                {initials}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-base font-extrabold text-slate-800 truncate leading-none">
                  {caseData.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <svg
                    className="h-3.5 w-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <a
                    href={`mailto:${caseData.email}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                  >
                    {caseData.email}
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center rounded-full bg-white text-slate-600 px-2.5 py-0.5 text-[10px] font-bold border border-slate-200 uppercase tracking-wide">
                    {formatCategory(caseData.category)}
                  </span>
                  {!isSpam && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${
                        urgencyStyles[caseData.urgency] || ""
                      }`}
                    >
                      {caseData.urgency}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* University & Case Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-200/50 mt-4 pt-4 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[9px]">
                  University
                </span>
                <span className="text-slate-700">{caseData.university}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[9px]">
                  Course & Year
                </span>
                <span className="text-slate-700">
                  {caseData.course} ({caseData.yearOfStudy})
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[9px]">
                  Date Received
                </span>
                <span className="text-slate-700">
                  {formatDateTime(caseData.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Original Enquiry Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Original Enquiry Message
              </h4>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-all bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-sm bg-slate-50 border border-slate-100 p-4.5 rounded-2xl leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto text-slate-700 shadow-inner">
              {caseData.message}
            </div>
          </div>

          {/* AI Copilot Insights Section */}
          {(caseData.staffSummary || caseData.aiReasoning) && (
            <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs tracking-wider uppercase">
                <svg
                  className="h-4.5 w-4.5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM18 10.5l-.563-3.187L14.25 7l3.187-.563L18 3.25l.563 3.187L21.75 7l-3.187.563L18 10.5z"
                  />
                </svg>
                <span>AI Copilot Analysis</span>
              </div>

              {caseData.staffSummary && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">
                    Diagnostic Summary
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {caseData.staffSummary}
                  </p>
                </div>
              )}

              {caseData.aiReasoning && (
                <div className="border-t border-indigo-100/30 pt-3">
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span className="uppercase tracking-wider">
                      View Classification Reasoning
                    </span>
                    <svg
                      className={`h-4.5 w-4.5 text-slate-400 transform transition-transform duration-200 ${
                        showReasoning ? "rotate-180 text-indigo-500" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {showReasoning && (
                    <div className="mt-2.5 text-xs text-slate-600 font-mono bg-white border border-slate-100 p-4 rounded-xl whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                      {caseData.aiReasoning}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enquiry Timeline Feed */}
          {followUps.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Enquiry Follow-up History
              </h4>
              <div className="space-y-4 relative pl-8 mt-2">
                {/* Timeline vertical connector */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100" />

                {followUps.map((followUp) => {
                  const isStudent = followUp.sender === "student";
                  const isAssistant = followUp.sender === "assistant";

                  return (
                    <div key={followUp.id} className="relative group">
                      {/* Timeline dot initials badge */}
                      <div
                        className={`absolute -left-8 top-1.5 h-7 w-7 rounded-full flex items-center justify-center border text-[9px] font-extrabold shadow-xs select-none ${
                          isStudent
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : isAssistant
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isStudent ? "ST" : isAssistant ? "AI" : "SY"}
                      </div>

                      <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-800 uppercase tracking-wider">
                            {formatFollowUpSender(followUp.sender)}
                          </span>
                          <span className="text-slate-400">
                            {formatDateTime(followUp.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {followUp.message}
                        </p>
                        {followUp.disposition && (
                          <div className="pt-1">
                            <span className="inline-flex rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              Outcome: {followUp.disposition.replace("_", " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Sticky) */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {isSpam ? (
            <>
              <span className="text-[11px] text-slate-400 font-semibold max-w-xs leading-normal">
                {caseData.injectionFlag
                  ? "Flagged for malicious prompt injection pattern."
                  : caseData.abuseFlag
                  ? "Flagged for hostile or abusive content."
                  : "Flagged as junk or advertisement spam."}
              </span>
              <button
                onClick={handleRestore}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer border border-emerald-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border capitalize ${
                    statusColorsModal[caseData.status] || ""
                  }`}
                >
                  {caseData.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">
                  Update Status:
                </span>
                <select
                  disabled={isUpdating}
                  value={caseData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold shadow-xs transition-colors focus:border-indigo-500 focus:outline-none cursor-pointer"
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

function formatFollowUpSender(sender: string) {
  if (sender === "student") return "Student";
  if (sender === "assistant") return "AI assistant";
  return "System";
}

