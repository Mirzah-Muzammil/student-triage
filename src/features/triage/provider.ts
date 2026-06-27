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

const GEMINI_PRIMARY_MODEL = "gemini-3-flash-preview";
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

  try {
    const res = await generateObject({
      model: google(GEMINI_PRIMARY_MODEL),
      schema: GeneratedTriageSchema,
      system,
      prompt,
      maxRetries: 0,
    });

    await recordProviderStatus({
      provider: "gemini",
      status: "available",
      lastError: null,
    });

    return { object: res.object, provider: "gemini" };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await recordProviderStatus({
      provider: "gemini",
      status: classifyProviderError(errorMessage),
      lastError: errorMessage,
    });

    if (!process.env.GROQ_API_KEY) {
      throw err;
    }

    logger.aiFallbackUsed({
      reason: "Primary Gemini failed, attempting Groq fallback",
      promptVersion,
    });

    return {
      object: await generateGroqFallbackObject(system, prompt),
      provider: "groq",
    };
  }
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
