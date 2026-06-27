import test from "node:test";
import assert from "node:assert/strict";
import { applyTriagePolicies } from "../src/features/triage/policy";
import type { TriageOutput } from "../src/features/triage/schema";

test("policy escalates critical safeguarding output", () => {
  const output: TriageOutput = {
    triage: {
      category: "health_wellbeing",
      urgency: "critical",
      safeguarding: true,
      disposition: "clarify",
      reasoning: "Student reports suicidal feelings.",
    },
    autoReply: null,
    clarifyQuestion: "Can you share more details?",
    staffSummary: null,
  };

  const result = applyTriagePolicies(output);

  assert.equal(result.triage.disposition, "escalate");
  assert.equal(result.triage.urgency, "critical");
  assert.equal(result.triage.safeguarding, true);
  assert.equal(result.clarifyQuestion, null);
  assert.match(result.staffSummary ?? "", /999/);
  assert.match(result.staffSummary ?? "", /116 123/);
});
