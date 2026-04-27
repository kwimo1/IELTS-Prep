export interface AppUserRecord {
  id: string;
  phone_number: string;
  password_hash?: string;
  payment_proof_url: string;
  is_activated: boolean;
  created_at: string;
  activated_at: string | null;
}

export interface AdminUserSummary {
  id: string;
  phone_number: string;
  payment_proof_url: string;
  created_at: string;
  activated_at?: string | null;
}

export interface EvaluationCriterion {
  label: string;
  score: number;
  feedback: string;
}

export interface IeltsEvaluation {
  overallBand: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  criteria: EvaluationCriterion[];
}

export type DashboardSectionId =
  | "listening"
  | "reading"
  | "writing"
  | "speaking";
