import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';
import { PaginationDto } from 'src/interfaces/common/dto/pagination.dto';

@Injectable()
export class GetAdherenceHistoryUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
  ) { }

  async execute(userId: string, page?: number, limit?: number, date?: string): Promise<{
    data: Adherence[];
    page: number;
    limit: number;
    total: number;
  }> {
    return await this.adherenceRepository.getHistory(userId, page, limit, date);
  }
}
