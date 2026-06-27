"use client";

import { type ApiResponse } from "@/services/submit/api";

interface IntakeResultScreenProps {
  response: ApiResponse;
  onReset: () => void;
}

export default function IntakeResultScreen({
  response,
  onReset,
}: IntakeResultScreenProps) {
  const { disposition, title, message } = response;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
          Request Outcome
        </h1>
        <p className="text-slate-400 text-xs mt-2 font-medium">
          We have processed your request. Below are the details and next steps.
        </p>
      </div>

      {/* Outcome Display Callout */}
      <div
        id="result-card"
        className={`rounded-2xl border-2 p-6 space-y-4 shadow-sm ${
          disposition === "handle_now"
            ? "bg-emerald-50/40 border-emerald-200/80 text-emerald-800"
            : disposition === "clarify"
              ? "bg-blue-50/40 border-blue-200/80 text-blue-800"
              : "bg-amber-50/40 border-amber-200/80 text-amber-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-[12px] ${
              disposition === "handle_now"
                ? "bg-emerald-100/80 text-emerald-600"
                : disposition === "clarify"
                  ? "bg-blue-100/80 text-blue-600"
                  : "bg-amber-100/80 text-amber-600"
            }`}
          >
            {disposition === "handle_now" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : disposition === "clarify" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <h3 className="font-bold text-sm tracking-tight text-slate-800">{title}</h3>
        </div>

        <p
          className="text-xs leading-relaxed font-semibold text-slate-600 whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: message
              ? message.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
              : "",
          }}
        />
      </div>

      {/* Crisis / Safeguarding Warning */}
      {disposition === "escalate" && message?.includes("999") && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm animate-pulse">
          <div className="p-2 bg-red-100 text-red-600 rounded-[12px] shrink-0 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
              Urgent Crisis Contacts
            </h4>
            <p className="text-xs text-red-700 font-semibold mt-1 leading-relaxed">
              If you are in immediate danger, please call <strong className="font-bold">999</strong> immediately. 
              For 24/7 confidential emotional support, call <strong className="font-bold">Samaritans on 116 123</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Return Button */}
      <button
        id="new-request-button"
        onClick={onReset}
        className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 px-6 text-xs font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-100 uppercase tracking-wider"
      >
        Submit Another Request
      </button>
    </div>
  );
}
