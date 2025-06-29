import { Inject, Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';

@Injectable()
export class GetAllRemindersUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) { }

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<{ data: Reminder[]; total: number; page: number; limit: number }> {
    return this.reminderRepository.findByUserWithPagination(userId, page, limit, startDate, endDate);
  }
}
