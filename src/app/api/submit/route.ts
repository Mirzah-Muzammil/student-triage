import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/core/db/prisma";
import { prescreen } from "@/features/triage/prescreen";
import { triageRequest, PROMPT_VERSION } from "@/features/triage/engine";
import { logger } from "@/core/logger";
import { z } from "zod";

// Vercel: allow up to 60s for AI call
export const maxDuration = 60;

const IntakeSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  university: z.string().min(1).max(200),
  course: z.string().min(1).max(200),
  yearOfStudy: z.string().min(1).max(50),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const intake = parsed.data;

  // ── PRE-SCREEN ────────────────────────────────────────────────────────────
  const prescreenResult = prescreen(intake.message);

  if (!prescreenResult.clean) {
    // Log the detection
    if (prescreenResult.reason === "injection") {
      logger.injectionDetected({ email: intake.email });
    } else if (prescreenResult.reason === "spam") {
      logger.spamDetected({ email: intake.email });
    }

    // Log it but do NOT escalate to staff — just discard
    await prisma.request.create({
      data: {
        ...intake,
        category: "other",
        urgency: "low",
        safeguarding: false,
        disposition: "spam",
        status: "resolved",
        injectionFlag: prescreenResult.reason === "injection",
        spamFlag: prescreenResult.reason === "spam",
        staffSummary: `Automatically discarded: ${prescreenResult.reason} detected.`,
        promptVersion: PROMPT_VERSION,
      },
    });
    revalidateTag("cases", { expire: 0 });

    // Return a neutral response — do not reveal detection to the sender
    return NextResponse.json({
      disposition: "spam",
      title: "Message received",
      message: "Thank you — your message has been received.",
    });
  }

  // ── AI TRIAGE ─────────────────────────────────────────────────────────────
  const triageOutput = await triageRequest({
    name: intake.name,
    university: intake.university,
    course: intake.course,
    yearOfStudy: intake.yearOfStudy,
    message: intake.message,
  });

  const isSpamDisposition = triageOutput.triage.disposition === "spam";
  const isInjection = isSpamDisposition && (
    triageOutput.triage.reasoning.toLowerCase().includes("injection") ||
    triageOutput.triage.reasoning.toLowerCase().includes("jailbreak") ||
    triageOutput.triage.reasoning.toLowerCase().includes("instruction")
  );
  const isSpam = isSpamDisposition && !isInjection;

  // ── PERSIST ───────────────────────────────────────────────────────────────
  await prisma.request.create({
    data: {
      ...intake,
      category: triageOutput.triage.category,
      urgency: triageOutput.triage.urgency,
      safeguarding: triageOutput.triage.safeguarding,
      disposition: triageOutput.triage.disposition,
      autoReply: triageOutput.autoReply,
      clarifyQuestion: triageOutput.clarifyQuestion,
      staffSummary: triageOutput.staffSummary,
      status: isSpamDisposition ? "resolved" : "new",
      spamFlag: isSpam,
      injectionFlag: isInjection,
      // V2: Persist reasoning and prompt version for internal debugging
      aiReasoning: triageOutput.triage.reasoning,
      promptVersion: PROMPT_VERSION,
    },
  });
  revalidateTag("cases", { expire: 0 });

  const latencyMs = Date.now() - startTime;

  // Log the completed request
  logger.requestSubmitted({
    disposition: triageOutput.triage.disposition,
    category: triageOutput.triage.category,
    urgency: triageOutput.triage.urgency,
    latencyMs,
  });

  // ── RESPONSE TO STUDENT ───────────────────────────────────────────────────
  // V2: Never expose reasoning, prompt, AI confidence, or internal flags.
  // Only return approved student-facing messages.
  const studentFacing = buildStudentResponse(triageOutput);

  return NextResponse.json({
    disposition: triageOutput.triage.disposition,
    ...studentFacing,
  });
}

function buildStudentResponse(output: Awaited<ReturnType<typeof triageRequest>>) {
  const { triage, autoReply, clarifyQuestion } = output;

  switch (triage.disposition) {
    case "spam":
      return {
        title: "Message received",
        message: "Thank you — your message has been received.",
      };

    case "handle_now":
      return {
        title: "We've got an answer for you",
        message: autoReply,
      };

    case "clarify":
      return {
        title: "We need a little more information",
        message: clarifyQuestion,
      };

    case "escalate": {
      const isCrisis = triage.safeguarding || triage.urgency === "critical";
      const emergencyNotice = isCrisis
        ? "\n\nIf you are in immediate danger, please call **999**. For confidential emotional support available 24/7, call **Samaritans on 116 123**."
        : "";

      return {
        title: "Your request has been passed to our team",
        message:
          `Thank you for reaching out. A member of our team will be in touch as soon as possible.${emergencyNotice}`,
      };
    }

    default:
      return {
        title: "Message received",
        message: "Thank you — a member of our team will follow up with you.",
      };
  }
}
