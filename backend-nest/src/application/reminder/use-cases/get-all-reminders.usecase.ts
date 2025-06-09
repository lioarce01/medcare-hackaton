import { Inject, Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';

@Injectable()
export class GetAllRemindersUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) {}

  async execute(userId: string, startDate?: string, endDate?: string): Promise<Reminder[]> {
    return this.reminderRepository.findByUser(userId, startDate, endDate);
  }
}
