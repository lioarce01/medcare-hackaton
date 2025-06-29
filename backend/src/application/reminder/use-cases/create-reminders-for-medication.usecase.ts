import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { ReminderGenerationService } from 'src/domain/reminder/services/reminder-generation.service';

@Injectable()
export class CreateRemindersForMedicationUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    private readonly reminderGenerationService: ReminderGenerationService,
  ) {}

  async execute(
    medication: Medication,
    userTimezone: string = 'UTC',
    daysAhead: number = 7
  ): Promise<void> {
    // Generate reminder DTOs for the medication
    const reminderDtos = this.reminderGenerationService.generateRemindersForMedication(
      medication,
      userTimezone,
      daysAhead
    );

    // Create all reminders in bulk
    if (reminderDtos.length > 0) {
      await this.reminderRepository.bulkCreate(reminderDtos);
    }
  }
}
