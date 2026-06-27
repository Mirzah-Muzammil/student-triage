import {
  buildResourceReply,
  findHandleNowResource,
  RESOURCES,
} from "./resources";
import type { TriageOutput } from "./schema";

const ALLOWED_URLS = new Set(RESOURCES.map((resource) => resource.url));
const URL_PATTERN = /\b(?:https?:\/\/|\/resources\/|tel:)[^\s),.]+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /\b(?:\+?\d[\d\s().-]{6,}\d)\b/g;
const ALLOWED_PHONE_DIGITS = new Set(["999", "116123"]);

const UNSUPPORTED_CLAIM_PATTERNS = [
  /\bguarantee[ds]?\b/i,
  /\bdefinitely\s+(?:eligible|qualif(?:y|ies)|approved)\b/i,
  /\byou\s+(?:must|should)\s+(?:sue|withhold\s+rent|stop\s+paying)\b/i,
  /\b(?:legal|immigration)\s+advice\b/i,
  /\bdecision\s+(?:today|tomorrow|within\s+24\s+hours)\b/i,
];

const VAGUE_CLARIFY_PATTERNS = [
  /^can you (?:please )?(?:provide|give|share|send) more (?:info|information|details)\??$/i,
  /^please (?:provide|give|share|send) more (?:info|information|details)\.?$/i,
  /^what do you need help with\??$/i,
  /^how can (?:i|we) help\??$/i,
];

type TriageDisposition = TriageOutput["triage"]["disposition"];

interface TriagePolicyContext {
  message?: string;
}

interface HandleNowPolicyInput {
  disposition: TriageDisposition;
  autoReply: string | null;
  staffSummary: string | null;
}

interface HandleNowPolicyOutput extends HandleNowPolicyInput {
  autoReply: string | null;
  staffSummary: string | null;
}

interface ClarifyPolicyInput {
  disposition: TriageDisposition;
  clarifyQuestion: string | null;
  staffSummary: string | null;
}

interface ClarifyPolicyOutput extends ClarifyPolicyInput {
  clarifyQuestion: string | null;
  staffSummary: string | null;
}

export function ensureCrisisStaffSummary(staffSummary: string | null): string {
  const base =
    staffSummary?.trim() ||
    "Possible crisis or immediate danger signal detected. Staff should review this request urgently.";
  const emergencySupport = "Emergency support surfaced to student: 999 and Samaritans 116 123.";

  if (base.includes("999") && base.includes("116 123")) {
    return base;
  }

  return `${base}\n\n${emergencySupport}`;
}

export function ensureHandleNowReplyIsGrounded(
  input: HandleNowPolicyInput
): HandleNowPolicyOutput {
  if (input.disposition !== "handle_now") {
    return input;
  }

  const autoReply = input.autoReply?.trim();
  if (!autoReply || !isGroundedAutoReply(autoReply)) {
    return {
      ...input,
      disposition: "escalate",
      autoReply: null,
      staffSummary:
        input.staffSummary ??
        "Could not verify a grounded reply from the resource library — escalated for human review.",
    };
  }

  return {
    ...input,
    autoReply,
  };
}

export function ensureClarifyQuestionIsActionable(
  input: ClarifyPolicyInput
): ClarifyPolicyOutput {
  if (input.disposition !== "clarify") {
    return input;
  }

  const clarifyQuestion = input.clarifyQuestion?.trim();
  if (!clarifyQuestion || !isActionableClarifyQuestion(clarifyQuestion)) {
    return {
      ...input,
      disposition: "escalate",
      clarifyQuestion: null,
      staffSummary:
        input.staffSummary ??
        "Clarifying question was missing, too vague, or too broad — escalated for human review.",
    };
  }

  return {
    ...input,
    clarifyQuestion,
  };
}

export function applyTriagePolicies(
  output: TriageOutput,
  context: TriagePolicyContext = {}
): TriageOutput {
  const result: TriageOutput = {
    triage: { ...output.triage },
    autoReply: output.autoReply,
    clarifyQuestion: output.clarifyQuestion,
    staffSummary: output.staffSummary,
  };

  if (result.triage.disposition === "spam") {
    result.autoReply = null;
    result.clarifyQuestion = null;
    result.staffSummary = "Automatically flagged as spam/promotional/injection.";
    result.triage.category = "other";
    result.triage.urgency = "low";
    result.triage.safeguarding = false;
    return result;
  }

  if (isCrisis(result)) {
    result.triage.disposition = "escalate";
    result.triage.safeguarding = true;
    if (result.triage.urgency !== "critical") {
      result.triage.urgency = "high";
    }
    result.staffSummary = ensureCrisisStaffSummary(result.staffSummary);
    result.autoReply = null;
    result.clarifyQuestion = null;
  }

  if (result.triage.category === "visa_immigration") {
    result.triage.disposition = "escalate";
    result.autoReply = null;
    result.clarifyQuestion = null;
    result.staffSummary =
      result.staffSummary ??
      "Immigration case — requires qualified adviser. Student directed to GOV.UK guidance.";
  }

  if (result.triage.disposition === "handle_now" && !result.autoReply) {
    const deterministicReply = getDeterministicHandleNowReply(
      result,
      context.message
    );

    if (deterministicReply) {
      result.autoReply = deterministicReply;
    } else {
      result.triage.disposition = "escalate";
      result.staffSummary =
        result.staffSummary ??
        "Could not generate a grounded reply — escalated for human review.";
    }
  }

  const groundedReplyCheck = ensureHandleNowReplyIsGrounded({
    disposition: result.triage.disposition,
    autoReply: result.autoReply,
    staffSummary: result.staffSummary,
  });
  result.triage.disposition = groundedReplyCheck.disposition;
  result.autoReply = groundedReplyCheck.autoReply;
  result.staffSummary = groundedReplyCheck.staffSummary;

  if (result.triage.disposition === "clarify" && !result.clarifyQuestion) {
    result.triage.disposition = "escalate";
    result.staffSummary =
      result.staffSummary ?? "Ambiguous request — escalated for human review.";
  }

  const clarifyQuestionCheck = ensureClarifyQuestionIsActionable({
    disposition: result.triage.disposition,
    clarifyQuestion: result.clarifyQuestion,
    staffSummary: result.staffSummary,
  });
  result.triage.disposition = clarifyQuestionCheck.disposition;
  result.clarifyQuestion = clarifyQuestionCheck.clarifyQuestion;
  result.staffSummary = clarifyQuestionCheck.staffSummary;

  return result;
}

function isCrisis(output: TriageOutput): boolean {
  return (
    output.triage.urgency === "critical" ||
    output.triage.safeguarding ||
    (output.triage.category === "health_wellbeing" &&
      output.triage.urgency === "high")
  );
}

function getDeterministicHandleNowReply(
  output: TriageOutput,
  message: string | undefined
): string | null {
  const resource = findHandleNowResource({
    category: output.triage.category,
    message,
  });
  if (!resource) {
    return null;
  }

  return buildResourceReply(resource);
}

function isGroundedAutoReply(reply: string): boolean {
  const urls = reply.match(URL_PATTERN) ?? [];
  const hasUnsupportedUrl = urls.some((url) => !ALLOWED_URLS.has(url));
  if (hasUnsupportedUrl || EMAIL_PATTERN.test(reply)) {
    return false;
  }

  const phoneNumbers = reply.match(PHONE_PATTERN) ?? [];
  const hasUnsupportedPhone = phoneNumbers.some((phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, "");
    return digits.length > 0 && !ALLOWED_PHONE_DIGITS.has(digits);
  });
  if (hasUnsupportedPhone) {
    return false;
  }

  return !UNSUPPORTED_CLAIM_PATTERNS.some((pattern) => pattern.test(reply));
}

function isActionableClarifyQuestion(question: string): boolean {
  const questionCount = (question.match(/\?/g) ?? []).length;
  if (questionCount < 1 || questionCount > 2) {
    return false;
  }

  return !VAGUE_CLARIFY_PATTERNS.some((pattern) => pattern.test(question));
}
