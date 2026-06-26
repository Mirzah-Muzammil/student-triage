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
