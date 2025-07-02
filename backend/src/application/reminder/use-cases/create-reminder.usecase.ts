import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { CreateReminderDto } from 'src/interfaces/reminder/dtos/create-reminder.dto';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class CreateReminderUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) { }

  async execute(reminder: CreateReminderDto): Promise<Reminder> {
    // Validate that the medication exists and belongs to the user
    const medication = await this.medicationRepository.findById(reminder.medication_id);
    if (!medication) {
      throw new NotFoundException(`Medication with id ${reminder.medication_id} not found`);
    }

    if (medication.user_id !== reminder.user_id) {
      throw new NotFoundException(`Medication does not belong to user`);
    }

    return this.reminderRepository.create(reminder);
  }
}
