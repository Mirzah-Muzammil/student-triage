import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/core/db/prisma";
import { prescreen } from "@/features/triage/prescreen";
import { triageRequest, PROMPT_VERSION } from "@/features/triage/engine";
import { buildStudentResponse } from "@/features/triage/student-response";
import { logger } from "@/core/logger";
import { z } from "zod";

export const maxDuration = 60;

const FollowUpSchema = z.object({
  requestId: z.string().min(1),
  message: z.string().min(3).max(5000),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = FollowUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { requestId, message } = parsed.data;
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      followUps: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.disposition !== "clarify") {
    return NextResponse.json(
      { error: "This request is no longer waiting for clarification." },
      { status: 409 }
    );
  }

  const prescreenResult = prescreen(message);
  if (!prescreenResult.clean) {
    await prisma.requestFollowUp.create({
      data: {
        requestId,
        sender: "student",
        message,
        disposition: "spam",
      },
    });
    revalidateTag("cases", { expire: 0 });

    return NextResponse.json({
      requestId,
      disposition: "spam",
      title: "Message received",
      message: "Thank you — your message has been received.",
    });
  }

  const triageOutput = await triageRequest({
    name: request.name,
    university: request.university,
    course: request.course,
    yearOfStudy: request.yearOfStudy,
    message: buildFollowUpTriageMessage({
      originalMessage: request.message,
      followUps: request.followUps,
      newMessage: message,
    }),
  });

  const isSpamDisposition = triageOutput.triage.disposition === "spam";
  const isInjection =
    isSpamDisposition &&
    (triageOutput.triage.reasoning.toLowerCase().includes("injection") ||
      triageOutput.triage.reasoning.toLowerCase().includes("jailbreak") ||
      triageOutput.triage.reasoning.toLowerCase().includes("instruction"));
  const isSpam = isSpamDisposition && !isInjection;

  await prisma.$transaction([
    prisma.requestFollowUp.create({
      data: {
        requestId,
        sender: "student",
        message,
        disposition: triageOutput.triage.disposition,
      },
    }),
    ...(triageOutput.clarifyQuestion
      ? [
          prisma.requestFollowUp.create({
            data: {
              requestId,
              sender: "assistant",
              message: triageOutput.clarifyQuestion,
              disposition: triageOutput.triage.disposition,
            },
          }),
        ]
      : []),
    prisma.request.update({
      where: { id: requestId },
      data: {
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
        aiReasoning: triageOutput.triage.reasoning,
        promptVersion: PROMPT_VERSION,
      },
    }),
  ]);
  revalidateTag("cases", { expire: 0 });

  logger.requestSubmitted({
    disposition: triageOutput.triage.disposition,
    category: triageOutput.triage.category,
    urgency: triageOutput.triage.urgency,
    latencyMs: Date.now() - startTime,
  });

  const studentFacing = buildStudentResponse(triageOutput);

  return NextResponse.json({
    requestId,
    disposition: triageOutput.triage.disposition,
    ...studentFacing,
  });
}

function buildFollowUpTriageMessage({
  originalMessage,
  followUps,
  newMessage,
}: {
  originalMessage: string;
  followUps: Array<{ sender: string; message: string }>;
  newMessage: string;
}) {
  const history = followUps
    .map((item) => `${item.sender}: ${item.message}`)
    .join("\n");

  return `
Original student message:
${originalMessage}

Clarification history:
${history || "No previous clarification messages recorded."}

Latest student follow-up:
${newMessage}

Treat the original message and latest follow-up as one enquiry. Decide the next disposition using the same policy.
`.trim();
}
