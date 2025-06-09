import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { AdherenceRepository } from 'src/domain/adherence/repositories/adherence.repository';
import { AdherenceGenerationService } from 'src/domain/adherence/services/adherence-generation.service';
import { CreateMedicationDto } from 'src/infrastructure/medication/dtos/create-medication.dto';

@Injectable()
export class CreateMedicationWithAdherenceUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceGenerationService: AdherenceGenerationService,
  ) {}

  async execute(medicationData: CreateMedicationDto): Promise<Medication> {
    // 1. Create the medication first
    const medication = await this.medicationRepository.create(medicationData);

    // 2. Generate adherence records based on the medication schedule
    const userTimezone = medicationData.user_timezone || 'UTC';
    const adherenceRecords = this.adherenceGenerationService.generateAdherenceRecords(
      medication,
      userTimezone,
    );

    // 3. Save all adherence records
    if (adherenceRecords.length > 0) {
      for (const adherenceRecord of adherenceRecords) {
        await this.adherenceRepository.create(adherenceRecord);
      }
    }

    // 4. Return the created medication
    return medication;
  }
}
