import type { TriageOutput } from "./schema";

export const FALLBACK_OUTPUT: TriageOutput = {
  triage: {
    category: "other",
    urgency: "high",
    safeguarding: false,
    disposition: "escalate",
    reasoning: "AI triage unavailable — defaulting to escalate for safety.",
  },
  autoReply: null,
  clarifyQuestion: null,
  staffSummary:
    "⚠️ AI triage was unavailable for this request. Please review manually.",
};

export function schemaFailureFallback(provider: string): TriageOutput {
  return {
    ...FALLBACK_OUTPUT,
    triage: {
      ...FALLBACK_OUTPUT.triage,
      reasoning: `AI Triage Error: Schema validation failed. Provider: ${provider}`,
    },
  };
}

export function aiFailureFallback(errorMessage: string): TriageOutput {
  return {
    ...FALLBACK_OUTPUT,
    triage: {
      ...FALLBACK_OUTPUT.triage,
      reasoning: `AI Triage Error: ${errorMessage}`,
    },
  };
}
