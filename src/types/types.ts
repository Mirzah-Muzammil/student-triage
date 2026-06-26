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
}
