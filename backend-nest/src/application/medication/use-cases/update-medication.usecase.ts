import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { UpdateMedicationDto } from 'src/interfaces/medication/dtos/update-medication.dto';

@Injectable()
export class UpdateMedicationUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) { }

  async execute(
    userId: string,
    medicationId: string,
    medicationData: UpdateMedicationDto,
  ): Promise<Medication> {
    const existingMedication = await this.medicationRepository.findById(medicationId);

    if (!existingMedication) {
      throw new NotFoundException('Medication not found');
    }

    if (existingMedication.user_id !== userId) {
      throw new ForbiddenException('You are not allowed to update this medication');
    }

    return this.medicationRepository.update(userId, medicationId, medicationData);
  }
}
