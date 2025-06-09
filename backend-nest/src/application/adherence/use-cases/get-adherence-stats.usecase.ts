import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { AdherenceStats } from '../../../domain/adherence/entities/adherence-stats.entity';
import { AdherenceStatsService } from '../../../domain/adherence/services/adherence-stats.service';

@Injectable()
export class GetAdherenceStatsUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceStatsService: AdherenceStatsService,
  ) {}

  async execute(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AdherenceStats> {
    // Use default date range if not provided
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (!startDate || !endDate) {
      const defaultRange = this.adherenceStatsService.getDefaultDateRange();
      finalStartDate = startDate || defaultRange.startDate;
      finalEndDate = endDate || defaultRange.endDate;
    }

    // Get raw stats data from repository
    const rawData = await this.adherenceRepository.getStats(
      userId,
      finalStartDate,
      finalEndDate,
    );

    // Process and return structured stats
    return this.adherenceStatsService.processStats(rawData);
  }
}
