import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class FindMedicationByIdUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findById(id);

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    return medication;
  }
}
