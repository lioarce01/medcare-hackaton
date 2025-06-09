import { Inject, Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';

@Injectable()
export class GetUpcomingRemindersUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) {}

  async execute(userId: string, limit: number = 10): Promise<Reminder[]> {
    return this.reminderRepository.findUpcomingByUser(userId, limit);
  }
}
