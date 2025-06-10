import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { CreateMedicationDto } from 'src/interfaces/medication/dtos/create-medication.dto';

@Injectable()
export class CreateMedicationUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async execute(medication: CreateMedicationDto): Promise<Medication> {
    return this.medicationRepository.create(medication);
  }
}
