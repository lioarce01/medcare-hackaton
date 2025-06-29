import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';

@Injectable()
export class DeleteReminderUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ message: string }> {
    // Verify the reminder belongs to the user
    const reminder = await this.reminderRepository.findById(id);
    
    if (!reminder || reminder.user_id !== userId) {
      throw new NotFoundException('Reminder not found or unauthorized');
    }

    return this.reminderRepository.delete(id);
  }
}
