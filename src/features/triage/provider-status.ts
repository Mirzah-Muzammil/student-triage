import { prisma } from "@/core/db/prisma";

export interface AiProviderStatusView {
  provider: string;
  status: string;
  lastCheckedAt: string | null;
  lastError: string | null;
  requestLimit: number | null;
  remainingRequests: number | null;
  tokenLimit: number | null;
  remainingTokens: number | null;
  requestReset: string | null;
  tokenReset: string | null;
}

interface ProviderStatusUpdate {
  provider: "gemini" | "groq";
  status: "available" | "quota_exceeded" | "rate_limited" | "error";
  lastError?: string | null;
  requestLimit?: number | null;
  remainingRequests?: number | null;
  tokenLimit?: number | null;
  remainingTokens?: number | null;
  requestReset?: string | null;
  tokenReset?: string | null;
}

type AiProviderStatusDelegate = {
  findMany: (args: {
    orderBy: { provider: "asc" };
  }) => Promise<Array<{
    provider: string;
    status: string;
    lastCheckedAt: Date;
    lastError: string | null;
    requestLimit: number | null;
    remainingRequests: number | null;
    tokenLimit: number | null;
    remainingTokens: number | null;
    requestReset: string | null;
    tokenReset: string | null;
  }>>;
  upsert: (args: {
    where: { provider: string };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
};

function getAiProviderStatusDelegate(): AiProviderStatusDelegate | null {
  const client = prisma as unknown as {
    aiProviderStatus?: AiProviderStatusDelegate;
  };

  return client.aiProviderStatus ?? null;
}

export async function recordProviderStatus(update: ProviderStatusUpdate) {
  try {
    const delegate = getAiProviderStatusDelegate();
    if (!delegate) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          event: "ai_provider_status_delegate_missing",
          provider: update.provider,
        })
      );
      return;
    }

    await delegate.upsert({
      where: { provider: update.provider },
      create: {
        provider: update.provider,
        status: update.status,
        lastCheckedAt: new Date(),
        lastError: update.lastError ?? null,
        requestLimit: update.requestLimit ?? null,
        remainingRequests: update.remainingRequests ?? null,
        tokenLimit: update.tokenLimit ?? null,
        remainingTokens: update.remainingTokens ?? null,
        requestReset: update.requestReset ?? null,
        tokenReset: update.tokenReset ?? null,
      },
      update: {
        status: update.status,
        lastCheckedAt: new Date(),
        lastError: update.lastError ?? null,
        requestLimit: update.requestLimit ?? undefined,
        remainingRequests: update.remainingRequests ?? undefined,
        tokenLimit: update.tokenLimit ?? undefined,
        remainingTokens: update.remainingTokens ?? undefined,
        requestReset: update.requestReset ?? undefined,
        tokenReset: update.tokenReset ?? undefined,
      },
    });
  } catch (err) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        event: "ai_provider_status_write_failed",
        provider: update.provider,
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
}

export async function getProviderStatuses(): Promise<AiProviderStatusView[]> {
  try {
    const delegate = getAiProviderStatusDelegate();
    if (!delegate) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          event: "ai_provider_status_delegate_missing",
        })
      );
      return [];
    }

    const rows = await delegate.findMany({
      orderBy: { provider: "asc" },
    });

    return rows.map((row) => ({
      provider: row.provider,
      status: row.status,
      lastCheckedAt: row.lastCheckedAt.toISOString(),
      lastError: row.lastError,
      requestLimit: row.requestLimit,
      remainingRequests: row.remainingRequests,
      tokenLimit: row.tokenLimit,
      remainingTokens: row.remainingTokens,
      requestReset: row.requestReset,
      tokenReset: row.tokenReset,
    }));
  } catch (err) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        event: "ai_provider_status_read_failed",
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return [];
  }
}

export function classifyProviderError(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  if (
    normalized.includes("quota") ||
    normalized.includes("limit exceeded") ||
    normalized.includes("exceeded your current quota")
  ) {
    return "quota_exceeded" as const;
  }
  if (normalized.includes("rate limit") || normalized.includes("429")) {
    return "rate_limited" as const;
  }
  return "error" as const;
}

export function readGroqRateLimitHeaders(headers: Headers) {
  return readGroqRateLimitHeaderSource((name) => headers.get(name));
}

export function readGroqRateLimitHeaderRecord(
  headers: Record<string, string> | undefined
) {
  return readGroqRateLimitHeaderSource((name) => {
    if (!headers) {
      return null;
    }

    return headers[name] ?? headers[name.toLowerCase()] ?? null;
  });
}

function readGroqRateLimitHeaderSource(
  getHeader: (name: string) => string | null
) {
  return {
    requestLimit: parseNullableInt(getHeader("x-ratelimit-limit-requests")),
    remainingRequests: parseNullableInt(
      getHeader("x-ratelimit-remaining-requests")
    ),
    tokenLimit: parseNullableInt(getHeader("x-ratelimit-limit-tokens")),
    remainingTokens: parseNullableInt(getHeader("x-ratelimit-remaining-tokens")),
    requestReset: getHeader("x-ratelimit-reset-requests"),
    tokenReset: getHeader("x-ratelimit-reset-tokens"),
  };
}

function parseNullableInt(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
