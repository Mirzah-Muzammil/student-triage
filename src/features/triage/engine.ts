import {
  normalizeGeneratedTriageOutput,
  TriageOutputSchema,
  type TriageOutput,
} from "./schema";
import { applyTriagePolicies } from "./policy";
import { aiFailureFallback, schemaFailureFallback } from "./fallbacks";
import { generateTriageObject } from "./provider";
import type { StudentContext } from "./prompt";
import { logger } from "@/core/logger";

// Prompt versioning — increment when the system prompt changes materially.
export const PROMPT_VERSION = "1.0.0";

export async function triageRequest(
  ctx: StudentContext
): Promise<TriageOutput> {
  const startTime = Date.now();

  try {
    const generated = await generateTriageObject(ctx, PROMPT_VERSION);
    const parsed = TriageOutputSchema.safeParse(
      normalizeGeneratedTriageOutput(generated.object)
    );

    if (!parsed.success) {
      logger.aiSchemaInvalid({
        error: parsed.error.message,
        promptVersion: PROMPT_VERSION,
      });
      logger.aiFallbackUsed({
        reason: "Schema validation failed",
        promptVersion: PROMPT_VERSION,
      });
      return schemaFailureFallback(generated.provider);
    }

    const result = applyTriagePolicies(parsed.data, { message: ctx.message });
    logTriageSuccess(result, startTime);

    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.aiTriageFailure({
      error: errorMessage,
      latencyMs: Date.now() - startTime,
      promptVersion: PROMPT_VERSION,
    });
    logger.aiFallbackUsed({
      reason: "AI call threw an exception",
      promptVersion: PROMPT_VERSION,
    });

    return aiFailureFallback(errorMessage);
  }
}

function logTriageSuccess(result: TriageOutput, startTime: number) {
  logger.aiTriageSuccess({
    latencyMs: Date.now() - startTime,
    category: result.triage.category,
    urgency: result.triage.urgency,
    disposition: result.triage.disposition,
    safeguarding: result.triage.safeguarding,
    promptVersion: PROMPT_VERSION,
  });
}
