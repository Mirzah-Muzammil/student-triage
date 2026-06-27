import { z } from "zod";

/**
 * Validates required environment variables at startup.
 * Fails fast with a clear error message if any are missing.
 */

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required"),
  GROQ_API_KEY: z.string().optional(),
  DASHBOARD_USER: z.string().min(1, "DASHBOARD_USER is required"),
  DASHBOARD_PASSWORD: z.string().min(1, "DASHBOARD_PASSWORD is required"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed env object.
 * Call this at app startup to fail fast on missing config.
 */


export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      `\n❌ Missing or invalid environment variables:\n${missing}\n\nSee .env.example for required variables.\n`
    );

    throw new Error("Environment validation failed. Check the logs above.");
  }

  return result.data;
}
