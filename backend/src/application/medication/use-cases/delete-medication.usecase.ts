import { Inject, Injectable } from '@nestjs/common';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class DeleteMedicationUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const medication = await this.medicationRepository.findById(id);
    await this.medicationRepository.delete(id);
  }
}
