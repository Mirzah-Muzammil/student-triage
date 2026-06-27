import type { TriageOutput } from "./schema";

export function buildStudentResponse(output: TriageOutput) {
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
