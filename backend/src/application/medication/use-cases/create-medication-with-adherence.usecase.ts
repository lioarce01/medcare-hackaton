import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { AdherenceRepository } from 'src/domain/adherence/repositories/adherence.repository';
import { AdherenceGenerationService } from 'src/domain/adherence/services/adherence-generation.service';
import { CreateMedicationDto } from 'src/interfaces/medication/dtos/create-medication.dto';
import { CreateRemindersForMedicationUseCase } from 'src/application/reminder/use-cases/create-reminders-for-medication.usecase';

@Injectable()
export class CreateMedicationWithAdherenceUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceGenerationService: AdherenceGenerationService,
    private readonly createRemindersForMedicationUseCase: CreateRemindersForMedicationUseCase,
  ) { }

  async execute(medicationData: CreateMedicationDto): Promise<Medication> {
    console.log('Creating medication for user_id:', medicationData.user_id);

    // 1. Create the medication first
    const medication = await this.medicationRepository.create(medicationData);

    // 2. Generate adherence records based on the medication schedule
    let userTimezone = medicationData.user_timezone;
    if (
      !userTimezone &&
      medication.user &&
      medication.user.settings &&
      medication.user.settings.timezone
    ) {
      userTimezone = medication.user.settings.timezone;
    }
    if (!userTimezone) {
      userTimezone = 'UTC';
    }
    const adherenceRecords =
      this.adherenceGenerationService.generateAdherenceRecords(
        medication,
        userTimezone,
      );

    // 3. Save all adherence records
    if (adherenceRecords.length > 0) {
      for (const adherenceRecord of adherenceRecords) {
        await this.adherenceRepository.create(adherenceRecord);
      }
    }

    // 4. Generate and save reminders for the medication
    await this.createRemindersForMedicationUseCase.execute(
      medication,
      userTimezone,
    );

    // 5. Return the created medication
    return medication;
  }
}
