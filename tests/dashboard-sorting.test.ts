import test from "node:test";
import assert from "node:assert/strict";
import { Case } from "../src/features/cases/types";
import { sortCasesByPriority } from "../src/utils/helpers";

test("sortCasesByPriority prefers safeguarding before urgency before newest", () => {
  const cases = [
    {
      id: "low-priority",
      safeguarding: false,
      urgency: "low",
      createdAt: "2026-06-27T09:00:00.000Z",
    },
    {
      id: "critical-priority",
      safeguarding: false,
      urgency: "critical",
      createdAt: "2026-06-27T08:00:00.000Z",
    },
    {
      id: "safeguarding-priority",
      safeguarding: true,
      urgency: "medium",
      createdAt: "2026-06-27T07:00:00.000Z",
    },
    {
      id: "critical-newest",
      safeguarding: false,
      urgency: "critical",
      createdAt: "2026-06-27T10:00:00.000Z",
    },
  ];

  const sorted = sortCasesByPriority(cases as unknown as Case[]);
  const sortedIds = sorted.map((c) => c.id);

  assert.deepEqual(sortedIds, [
    "safeguarding-priority", // safeguarding first
    "critical-newest",       // critical, newest first (10:00 vs 08:00)
    "critical-priority",     // critical, older
    "low-priority",          // low urgency
  ]);
});
