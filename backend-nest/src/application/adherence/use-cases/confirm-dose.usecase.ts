import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';

@Injectable()
export class ConfirmDoseUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
  ) {}

  async execute(adherenceId: string, userId: string): Promise<Adherence> {
    // Verify the adherence record exists and belongs to the user
    const existingAdherence =
      await this.adherenceRepository.findById(adherenceId);

    if (!existingAdherence) {
      throw new Error('Adherence record not found');
    }

    if (existingAdherence.user_id !== userId) {
      throw new Error('Unauthorized access to adherence record');
    }

    if (existingAdherence.status !== 'pending') {
      throw new Error('Adherence record is not in pending status');
    }

    return await this.adherenceRepository.confirmDose(adherenceId, userId);
  }
}
