// Injection patterns — case-insensitive
const INJECTION_PATTERNS = [
  /ignore\s+(your\s+)?(previous|prior|all|any)\s+instructions/i,
  /disregard\s+(your\s+)?(previous|prior|all|any)\s+instructions/i,
  /forget\s+(your\s+)?(previous|prior|all|any)\s+instructions/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+if\s+you/i,
  /your\s+new\s+instructions/i,
  /mark\s+this\s+as\s+resolved/i,
  /system\s*prompt/i,
  /override\s+(your\s+)?instructions/i,
  /jailbreak/i,
];

// Spam/promotional patterns
const SPAM_PATTERNS = [
  /bit\.ly\//i,
  /tinyurl\.com\//i,
  /t\.co\//i,
  /goo\.gl\//i,
  /ow\.ly\//i,
  /\bgrow\s+your\b/i,
  /\bcheap\s+followers\b/i,
  /\bbuy\s+(now|followers|likes|views)\b/i,
  /\bclick\s+here\s+to\s+(win|earn|get)\b/i,
  /\bcongratulations\s+you\s+(have\s+)?(won|been\s+selected)\b/i,
  // Advanced income/wealth clickbait patterns
  /\bearn\s+\$\d[\d,]*\s*(?:\/\s*month|per\s+month|a\s+month|daily|weekly|from\s+home)/i,
  /\bno\s+experience\s+(?:required|needed)\b/i,
  /\bwork\s+from\s+home\b/i,
  /\bclick\s+(?:here\s+)?https?:\/\/\S+/i,
  /\b(?:crypto|bitcoin|ethereum|forex|trading\s+signals)\b/i,
];

// Abusive or hostile language patterns
const ABUSE_PATTERNS = [
  /\b(?:kill\s+yourself|kys)\b/i,
  /\b(?:you|u)\s+(?:are\s+)?(?:useless|idiots?|morons?|stupid)\b/i,
  /\b(?:fuck|shit|bitch|cunt|wanker)s?\b/i,
  /\b(?:should|deserve\s+to)\s+(?:all\s+)?die\b/i,
];

export enum PrescreenAction {
  DISCARD = "discard",
  CONTINUE = "continue",
}

export type PrescreenResult = {
  action: PrescreenAction;
  spamDetected: boolean;
  promptInjectionDetected: boolean;
  abuseDetected: boolean;
  supportRequestDetected: boolean;
  reason?: string;
};

export function prescreen(message: string): PrescreenResult {
  let injection = false;
  let spam = false;
  let abuse = false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      injection = true;
      break;
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message)) {
      spam = true;
      break;
    }
  }

  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(message)) {
      abuse = true;
      break;
    }
  }

  const supportRequestDetected = appearsToContainStudentSupportRequest(message);

  if (supportRequestDetected) {
    return {
      action: PrescreenAction.CONTINUE,
      spamDetected: spam,
      promptInjectionDetected: injection,
      abuseDetected: abuse,
      supportRequestDetected,
    };
  }

  return {
    action: PrescreenAction.DISCARD,
    spamDetected: spam,
    promptInjectionDetected: injection,
    abuseDetected: abuse,
    supportRequestDetected,
    reason: getDiscardReason({ injection, spam, abuse }),
  };
}

function appearsToContainStudentSupportRequest(message: string): boolean {
  const lowercase = message.toLowerCase();

  const supportTopics = [
    "academic",
    "accommodation",
    "assignment",
    "cas",
    "course",
    "deposit",
    "exam",
    "finance",
    "housing",
    "landlord",
    "library",
    "mental health",
    "rent",
    "scholarship",
    "student support",
    "visa",
    "wellbeing",
  ];

  const crisisSignals = [
    "depressed",
    "depression",
    "end my life",
    "feeling really low",
    "feel really low",
    "kill myself",
    "live anymore",
    "mental health",
    "suicidal",
    "want to die",
  ];

  const problemSignals = [
    "can't",
    "cannot",
    "delayed",
    "due",
    "expires",
    "expiring",
    "failed",
    "hasn't",
    "haven't",
    "help",
    "missed",
    "need",
    "problem",
    "struggling",
    "support",
    "worried",
    "won't",
  ];

  const helpSeekingSignals = [
    "can someone help",
    "could someone help",
    "i need help",
    "need advice",
    "need support",
    "please help",
  ];

  const hasTopic = supportTopics.some((topic) => lowercase.includes(topic));
  const hasProblem = problemSignals.some((signal) => lowercase.includes(signal));
  const hasCrisis = crisisSignals.some((signal) => lowercase.includes(signal));
  const isHelpSeeking = helpSeekingSignals.some((signal) =>
    lowercase.includes(signal),
  );

  return hasCrisis || isHelpSeeking || (hasTopic && hasProblem);
}

function getDiscardReason({
  injection,
  spam,
  abuse,
}: {
  injection: boolean;
  spam: boolean;
  abuse: boolean;
}) {
  if (spam) {
    return "spam_without_support_request";
  }

  if (injection) {
    return "prompt_injection_without_support_request";
  }

  if (abuse) {
    return "abuse_without_support_request";
  }

  return "no_support_request_detected";
}
