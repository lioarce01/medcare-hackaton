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
    console.log('=== CREATE MEDICATION WITH ADHERENCE ===');
    console.log('Creating medication for user_id:', medicationData.user_id);
    console.log('Medication data:', JSON.stringify(medicationData, null, 2));

    // 1. Create the medication first
    const medication = await this.medicationRepository.create(medicationData);
    console.log('Medication created with ID:', medication.id);

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
    console.log('Using timezone:', userTimezone);

    const adherenceRecords =
      this.adherenceGenerationService.generateAdherenceRecords(
        medication,
        userTimezone,
      );
    console.log('Generated adherence records count:', adherenceRecords.length);
    console.log('Adherence records:', JSON.stringify(adherenceRecords, null, 2));

    // 3. Save all adherence records (checking for duplicates)
    if (adherenceRecords.length > 0) {
      console.log('Saving adherence records...');
      for (const adherenceRecord of adherenceRecords) {
        try {
          // Check if adherence record already exists to avoid duplicates
          const exists = await this.adherenceRepository.exists(
            adherenceRecord.user_id,
            adherenceRecord.medication_id,
            adherenceRecord.scheduled_datetime,
          );

          if (!exists) {
            await this.adherenceRepository.create(adherenceRecord);
            console.log('Saved adherence record:', adherenceRecord.id);
          } else {
            console.log('Adherence record already exists, skipping:', adherenceRecord.id);
          }
        } catch (error) {
          console.error('Error saving adherence record:', error);
        }
      }
    } else {
      console.log('No adherence records to save');
    }

    // 4. Generate and save reminders for the medication
    try {
      await this.createRemindersForMedicationUseCase.execute(
        medication,
        userTimezone,
      );
      console.log('Reminders created successfully');
    } catch (error) {
      console.error('Error creating reminders:', error);
    }

    // 5. Return the created medication
    console.log('=== MEDICATION CREATION COMPLETE ===');
    return medication;
  }
}
