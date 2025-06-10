import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { UpdateMedicationDto } from 'src/interfaces/medication/dtos/update-medication.dto';

@Injectable()
export class UpdateMedicationUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(medication: UpdateMedicationDto): Promise<Medication> {
    const existingMedication = await this.medicationRepository.findById(
      medication.id,
    );

    if (!existingMedication) {
      throw new NotFoundException('Medication not found');
    }

    return this.medicationRepository.update(medication);
  }
}
