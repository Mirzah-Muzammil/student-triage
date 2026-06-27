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

export type PrescreenResult = {
  action: "continue" | "discard";
  injection: boolean;
  spam: boolean;
  abuse: boolean;
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

  const matchesAny = injection || spam || abuse;
  const isMixed = matchesAny && hasCrisisOrVisaSignals(message);

  return {
    action: matchesAny && !isMixed ? "discard" : "continue",
    injection,
    spam,
    abuse,
  };
}

function hasCrisisOrVisaSignals(message: string): boolean {
  const lowercase = message.toLowerCase();
  
  const crisisKeywords = [
    "feeling really low",
    "feel really low",
    "haven't left my room",
    "havent left my room",
    "see the point of anything",
    "suicidal",
    "kill myself",
    "end my life",
    "want to die",
    "feeling low for weeks",
    "haven't eaten properly",
    "havent eaten properly",
    "mental health",
    "depressed",
    "depression",
    "live anymore",
    "want to live",
  ];
  
  const visaKeywords = [
    "visa",
    "cas",
    "immigration",
  ];
  
  return (
    crisisKeywords.some(kw => lowercase.includes(kw)) ||
    visaKeywords.some(kw => lowercase.includes(kw))
  );
}
