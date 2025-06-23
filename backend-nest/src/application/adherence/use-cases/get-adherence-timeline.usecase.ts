import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from 'src/domain/adherence/repositories/adherence.repository';
import { Adherence } from 'src/domain/adherence/entities/adherence.entity';

@Injectable()
export class GetAdherenceTimelineUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
  ) { }

  async execute(userId: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<{
    data: Adherence[],
    page: number,
    limit: number,
    total: number
  }> {
    return this.adherenceRepository.getTimeline(userId, startDate, endDate, page, limit);
  }
}
