import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';

@Injectable()
export class GetAdherenceHistoryUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
  ) {}

  async execute(userId: string, date?: string): Promise<Adherence[]> {
    return await this.adherenceRepository.getHistory(userId, date);
  }
}
