import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { logger } from "@/core/logger";
import { TriageSchema } from "./schema";
import { buildSystemPrompt, buildUserPrompt, type StudentContext } from "./prompt";
import {
  classifyProviderError,
  readGroqRateLimitHeaderRecord,
  recordProviderStatus,
} from "./provider-status";

// Detailed chain of available Gemini models based on console allocation limits
const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile";

const GeneratedTriageSchema = z.object({
  triage: TriageSchema,
  autoReply: z.string().nullable(),
  clarifyQuestion: z.string().nullable(),
  staffSummary: z.string().nullable(),
});

export interface GeneratedTriageObject {
  object: unknown;
  provider: "gemini" | "groq";
}

export async function generateTriageObject(
  ctx: StudentContext,
  promptVersion: string
): Promise<GeneratedTriageObject> {
  const system = buildSystemPrompt();
  const prompt = buildUserPrompt(ctx);

  let lastError: unknown = null;

  // Try each Gemini model in the fallback chain
  for (const modelName of GEMINI_MODELS) {
    try {
      const res = await generateObject({
        model: google(modelName),
        schema: GeneratedTriageSchema,
        system,
        prompt,
        maxRetries: 0,
      });

      // Mark Gemini as successfully available
      await recordProviderStatus({
        provider: "gemini",
        status: "available",
        lastError: null,
      });

      return { object: res.object, provider: "gemini" };
    } catch (err) {
      lastError = err;
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Record error status details for the current model attempt
      await recordProviderStatus({
        provider: "gemini",
        status: classifyProviderError(errorMessage),
        lastError: `${modelName} error: ${errorMessage}`,
      });

      logger.aiFallbackUsed({
        reason: `Primary ${modelName} failed (${errorMessage.substring(0, 100)}), trying next model...`,
        promptVersion,
      });
    }
  }

  if (!process.env.GROQ_API_KEY) {
    throw lastError || new Error("All Gemini models failed and no GROQ_API_KEY is configured.");
  }

  logger.aiFallbackUsed({
    reason: "All Gemini models failed, attempting Groq fallback",
    promptVersion,
  });

  return {
    object: await generateGroqFallbackObject(system, prompt),
    provider: "groq",
  };
}

async function generateGroqFallbackObject(
  system: string,
  prompt: string
): Promise<unknown> {
  try {
    const res = await generateObject({
      model: groq(GROQ_FALLBACK_MODEL),
      schema: GeneratedTriageSchema,
      system,
      prompt,
      mode: "json",
      temperature: 0,
      maxRetries: 0,
    });

    await recordProviderStatus({
      provider: "groq",
      status: "available",
      lastError: null,
    });

    return res.object;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await recordProviderStatus({
      provider: "groq",
      status: classifyProviderError(errorMessage),
      lastError: errorMessage,
      ...readGroqRateLimitHeaderRecord(readErrorResponseHeaders(err)),
    });
    throw err;
  }
}

function readErrorResponseHeaders(err: unknown): Record<string, string> | undefined {
  if (!err || typeof err !== "object") {
    return undefined;
  }

  const responseHeaders = (err as { responseHeaders?: unknown }).responseHeaders;
  if (!responseHeaders || typeof responseHeaders !== "object") {
    return undefined;
  }

  return responseHeaders as Record<string, string>;
}
