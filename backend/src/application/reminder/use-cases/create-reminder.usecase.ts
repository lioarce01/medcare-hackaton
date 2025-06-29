import { Inject, Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { CreateReminderDto } from 'src/interfaces/reminder/dtos/create-reminder.dto';

@Injectable()
export class CreateReminderUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) {}

  async execute(reminder: CreateReminderDto): Promise<Reminder> {
    return this.reminderRepository.create(reminder);
  }
}
