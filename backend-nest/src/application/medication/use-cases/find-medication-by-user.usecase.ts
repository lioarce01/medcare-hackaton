import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class FindMedicationByUserUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(userId: string): Promise<Medication[]> {
    const medications = await this.medicationRepository.findByUser(userId);
    return medications;
  }
}
