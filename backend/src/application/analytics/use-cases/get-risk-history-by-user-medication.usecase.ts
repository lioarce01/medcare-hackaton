import { Injectable, Inject } from '@nestjs/common';
import { RiskHistoryRepository } from 'src/domain/analytics/repositories/risk-history.repository';
import { RiskHistory } from 'src/domain/analytics/entities/risk-history.entity';

@Injectable()
export class GetRiskHistoryByUserMedicationUseCase {
  constructor(
    @Inject('RiskHistoryRepository')
    private readonly riskHistoryRepository: RiskHistoryRepository,
  ) { }

  async execute(userId: string, medicationId: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
    data: RiskHistory[],
    page: number,
    limit: number,
    total: number
  }> {
    return this.riskHistoryRepository.findByUserMedication(userId, medicationId, startDate, endDate, page, limit);
  }
}
