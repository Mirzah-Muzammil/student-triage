import { z } from "zod";

export const TriageSchema = z.object({
  category: z.enum([
    "academic",
    "financial",
    "visa_immigration",
    "housing",
    "health_wellbeing",
    "other",
  ]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  safeguarding: z.boolean(),
  disposition: z.enum(["handle_now", "clarify", "escalate", "spam"]),
  reasoning: z.string().max(500), // internal, not shown to student
});

export type TriageResult = z.infer<typeof TriageSchema>;

// Output schema for generated text content
export const TriageOutputSchema = z.object({
  triage: TriageSchema,
  autoReply: z.string().nullable(),       // populated when disposition === handle_now
  clarifyQuestion: z.string().nullable(), // populated when disposition === clarify
  staffSummary: z.string().nullable(),    // populated when disposition === escalate
});

export type TriageOutput = z.infer<typeof TriageOutputSchema>;

export function normalizeGeneratedTriageOutput(output: unknown): unknown {
  if (!isRecord(output) || !isRecord(output.triage)) {
    return output;
  }

  const safeguarding = output.triage.safeguarding;
  if (safeguarding !== "true" && safeguarding !== "false") {
    return output;
  }

  return {
    ...output,
    triage: {
      ...output.triage,
      safeguarding: safeguarding === "true",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
