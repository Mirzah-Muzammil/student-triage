"use client";

import { AiProviderStatus } from "@/features/cases/types";
import { formatDateTime } from "@/utils/helpers";

interface ProviderStatusPanelProps {
  statuses: AiProviderStatus[];
}

export default function ProviderStatusPanel({ statuses }: ProviderStatusPanelProps) {
  const providers = ["gemini", "groq"].map((provider) => {
    return (
      statuses.find((status) => status.provider === provider) ?? {
        provider,
        status: "unknown",
        lastCheckedAt: null,
        lastError: null,
        requestLimit: null,
        remainingRequests: null,
        tokenLimit: null,
        remainingTokens: null,
        requestReset: null,
        tokenReset: null,
      }
    );
  });

  return (
    <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            AI Provider Status
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Last known status from real triage calls. No extra quota is spent to
            refresh this panel.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((provider) => (
          <div
            key={provider.provider}
            className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {provider.provider}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {provider.lastCheckedAt
                      ? `Last checked ${formatDateTime(provider.lastCheckedAt)}`
                      : "No calls recorded yet"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${providerStatusClass(
                    provider.status,
                  )}`}
                >
                  {provider.status.replace("_", " ")}
                </span>
              </div>

              {provider.provider === "groq" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric
                    label="Requests"
                    value={formatLimit(
                      provider.remainingRequests,
                      provider.requestLimit,
                    )}
                  />
                  <Metric
                    label="Tokens"
                    value={formatLimit(
                      provider.remainingTokens,
                      provider.tokenLimit,
                    )}
                  />
                </div>
              )}
            </div>

            {provider.lastError && (
              <p className="mt-4 line-clamp-2 rounded-lg bg-white/80 border border-slate-100 p-2.5 font-mono text-[11px] text-slate-500">
                {provider.lastError}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function providerStatusClass(status: string) {
  if (status === "available") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "quota_exceeded" || status === "rate_limited") {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "error") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-500";
}

function formatLimit(remaining: number | null, limit: number | null) {
  if (remaining === null && limit === null) {
    return "Unknown";
  }
  if (limit === null) {
    return String(remaining);
  }
  return `${remaining ?? "?"}/${limit}`;
}
