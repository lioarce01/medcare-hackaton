import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class FindActiveDailyMedicationUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(): Promise<Medication[]> {
    const medications =
      await this.medicationRepository.findActiveDailyMedications();
    return medications;
  }
}
