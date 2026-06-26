/**
 * Structured resource library for grounding AI responses.
 *
 * V2 requirement: Resources must be stored as structured objects
 * in a separate file, serialized into the prompt at runtime.
 * Never hardcode resource text inside triage.ts.
 */

export interface Resource {
  id: string;
  name: string;
  url: string;
  description: string;
  notes: string;
}

export const RESOURCES: Resource[] = [
  {
    id: "student-visa",
    name: "Student visa and CAS",
    url: "https://www.gov.uk/student-visa",
    description:
      "Official GOV.UK guidance on Student visas.",
    notes:
      "IMPORTANT: Immigration is regulated in the UK. Do NOT advise on a student's individual situation. Only share this link and route to a human.",
  },
  {
    id: "hardship-fund",
    name: "University Hardship Fund",
    url: "/resources/hardship-fund",
    description:
      "One-off discretionary grants for unexpected financial difficulty: delayed loans/scholarships, emergency costs, sudden income drop, inability to cover rent/food/utilities.",
    notes:
      "Most students eligible including international. Emergency route available when rent/essentials at immediate risk. Decisions normally 5–10 working days (faster for emergencies). Does not cover fees or debts to third parties.",
  },
  {
    id: "deposit-guide",
    name: "Tenancy Deposits",
    url: "/resources/deposit-guide",
    description:
      "Landlords must protect deposits in a government-approved scheme within 30 days. Disputes: request itemised breakdown, then use scheme's free adjudication service.",
    notes:
      "This is general information only — not legal advice. Complex cases (unprotected deposit, large sums, unresponsive landlord) should see a housing adviser or students' union.",
  },
  {
    id: "library",
    name: "Academic Resources",
    url: "/resources/library",
    description:
      "Past exam papers, reading lists, lecture materials via university library portal. Sign in with university account. Organised by module code.",
    notes:
      "Not all modules have full past papers. Missing materials: contact module leader or academic liaison librarian.",
  },
  {
    id: "wellbeing",
    name: "Wellbeing and Counselling",
    url: "/resources/wellbeing",
    description:
      "For non-urgent mental health concerns: stress, low mood, anxiety, homesickness, sleep, academic pressure. Self-refer via online form.",
    notes:
      "NOT an emergency service. If in crisis / unsafe / thoughts of self-harm → direct to Samaritans + escalate immediately.",
  },
  {
    id: "samaritans",
    name: "Samaritans (urgent emotional support)",
    url: "tel:116123",
    description:
      "116 123 — available 24/7. Share whenever someone is struggling to cope or in distress.",
    notes: "Does NOT replace escalation.",
  },
  {
    id: "emergency",
    name: "Emergency services",
    url: "tel:999",
    description:
      "999 — Immediate danger to life or safety only.",
    notes: "Always escalate such cases at highest priority.",
  },
];

/**
 * Serializes the resource library into a formatted string
 * suitable for inclusion in an AI system prompt.
 */
export function serializeResourcesForPrompt(): string {
  return RESOURCES.map(
    (r, i) =>
      `${i + 1}. ${r.name} — ${r.url}\n   ${r.description}\n   ${r.notes}`
  ).join("\n\n");
}
