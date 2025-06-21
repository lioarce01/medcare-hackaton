import { RiskHistory } from "../entities/risk-history.entity";


export interface RiskHistoryRepository {
  create(record: RiskHistory): Promise<void>;
  findByUserMedication(userId: string, medicationId: string, startDate?: string, endDate?: string): Promise<RiskHistory[]>;
  findByUser(userId: string, startDate?: string, endDate?: string): Promise<RiskHistory[]>;
  getLatestRiskScore(userId: string, medicationId: string): Promise<number | null>;
}
