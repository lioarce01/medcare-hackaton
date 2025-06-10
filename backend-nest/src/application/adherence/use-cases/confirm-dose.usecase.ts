import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';
import { AdherenceValidationService } from '../../../domain/adherence/services/adherence-validation.service';

@Injectable()
export class ConfirmDoseUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceValidationService: AdherenceValidationService,
  ) {}

  async execute(adherenceId: string, userId: string): Promise<Adherence> {
    // Verify the adherence record exists and belongs to the user
    const existingAdherence =
      await this.adherenceRepository.findById(adherenceId);

    this.adherenceValidationService.validateAdherenceForStatusChange(
      existingAdherence,
      adherenceId,
      userId,
    );

    return await this.adherenceRepository.confirmDose(adherenceId, userId);
  }
}
