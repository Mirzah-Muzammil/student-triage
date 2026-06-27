export interface Case {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  university: string;
  course: string;
  yearOfStudy: string;
  message: string;
  category: string;
  urgency: string;
  safeguarding: boolean;
  staffSummary: string | null;
  status: string;
  disposition: string;
  spamFlag: boolean;
  injectionFlag: boolean;
  aiReasoning?: string | null;
  promptVersion?: string | null;
  followUps?: CaseFollowUp[];
}

export interface CaseFollowUp {
  id: string;
  createdAt: string;
  sender: string;
  message: string;
  disposition: string | null;
}

export interface AiProviderStatus {
  provider: string;
  status: string;
  lastCheckedAt: string | null;
  lastError: string | null;
  requestLimit: number | null;
  remainingRequests: number | null;
  tokenLimit: number | null;
  remainingTokens: number | null;
  requestReset: string | null;
  tokenReset: string | null;
}
