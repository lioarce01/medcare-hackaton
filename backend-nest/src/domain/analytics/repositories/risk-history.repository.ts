import { RiskHistory } from "../entities/risk-history.entity";


export interface RiskHistoryRepository {
  create(record: RiskHistory): Promise<void>;
  findByUserMedication(userId: string, medicationId: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
    data: RiskHistory[],
    page: number,
    limit: number,
    total: number
  }>;
  findByUser(userId: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
    data: RiskHistory[],
    page: number,
    limit: number,
    total: number
  }>;
  getLatestRiskScore(userId: string, medicationId: string): Promise<number | null>;
}
