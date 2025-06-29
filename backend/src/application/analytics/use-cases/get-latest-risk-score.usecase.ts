import { Injectable, Inject } from '@nestjs/common';
import { RiskHistoryRepository } from 'src/domain/analytics/repositories/risk-history.repository';

@Injectable()
export class GetLatestRiskScoreUseCase {
  constructor(
    @Inject('RiskHistoryRepository')
    private readonly riskHistoryRepository: RiskHistoryRepository,
  ) { }

  async execute(userId: string, medicationId: string): Promise<number | null> {
    return this.riskHistoryRepository.getLatestRiskScore(userId, medicationId);
  }
}
