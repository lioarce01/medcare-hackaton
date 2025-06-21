export interface RiskHistory {
  id: string;
  user_id: string;
  medication_id: string;
  date: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export interface LatestRiskScore {
  risk_score: number | null;
}
