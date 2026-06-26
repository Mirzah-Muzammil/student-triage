/**
 * Structured server-side logging utility.
 *
 * Log AI latency, AI failures, invalid AI schema,
 * prompt injection detections, spam detections, and fallback usage.
 * Never expose logs to users.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  [key: string]: unknown;
}

function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  // Structured JSON logging — suitable for log aggregators
  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  /** Log successful AI triage with latency */
  aiTriageSuccess(data: {
    latencyMs: number;
    category: string;
    urgency: string;
    disposition: string;
    safeguarding: boolean;
    promptVersion: string;
  }) {
    log("info", "ai_triage_success", data);
  },

  /** Log AI triage failure */
  aiTriageFailure(data: { error: string; latencyMs: number; promptVersion: string }) {
    log("error", "ai_triage_failure", data);
  },

  /** Log invalid AI schema output (Zod validation failure) */
  aiSchemaInvalid(data: { error: string; promptVersion: string }) {
    log("error", "ai_schema_invalid", data);
  },

  /** Log fallback usage */
  aiFallbackUsed(data: { reason: string; promptVersion: string }) {
    log("warn", "ai_fallback_used", data);
  },

  /** Log prompt injection detection */
  injectionDetected(data: { email: string }) {
    log("warn", "injection_detected", { email: data.email });
  },

  /** Log spam detection */
  spamDetected(data: { email: string }) {
    log("warn", "spam_detected", { email: data.email });
  },

  /** Log abusive input detection */
  abuseDetected(data: { email: string }) {
    log("warn", "abuse_detected", { email: data.email });
  },

  /** Log request submission */
  requestSubmitted(data: {
    disposition: string;
    category: string;
    urgency: string;
    latencyMs: number;
  }) {
    log("info", "request_submitted", data);
  },
};
