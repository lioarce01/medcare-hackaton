export interface RiskHistoryRecord {
  user_id: string;
  medication_id: string;
  date: string;
  risk_score: number;
}

export interface RiskHistoryRepository {
  create(record: RiskHistoryRecord): Promise<void>;
  findByUserMedication(userId: string, medicationId: string, startDate?: string, endDate?: string): Promise<RiskHistoryRecord[]>;
  findByUser(userId: string, startDate?: string, endDate?: string): Promise<RiskHistoryRecord[]>;
  getLatestRiskScore(userId: string, medicationId: string): Promise<number | null>;
}
