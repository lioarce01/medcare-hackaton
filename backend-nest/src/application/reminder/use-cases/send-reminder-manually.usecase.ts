import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { NotificationService } from 'src/domain/reminder/services/notification.service';
import { UserRepository } from 'src/domain/user/repositories/user.repository';

@Injectable()
export class SendReminderManuallyUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('NotificationService')
    private readonly notificationService: NotificationService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(reminderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Get the reminder and verify it belongs to the user
    const reminder = await this.reminderRepository.findById(reminderId);
    
    if (!reminder || reminder.user_id !== userId) {
      throw new NotFoundException('Reminder not found or unauthorized');
    }

    // Check if user is premium
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPremium = user.subscription_status === 'premium' && 
                     user.subscription_expires_at && 
                     new Date(user.subscription_expires_at) > new Date();

    if (!isPremium) {
      throw new ForbiddenException('Premium subscription required');
    }

    try {
      // Send the reminder via email
      await this.notificationService.sendEmailReminder(reminder);

      // Mark as sent
      await this.reminderRepository.markAsSent(reminderId, 'email');

      return {
        success: true,
        message: 'Reminder sent successfully',
      };
    } catch (error) {
      // Mark as failed
      await this.reminderRepository.markAsFailed(reminderId);
      
      throw new Error(`Failed to send reminder: ${error.message}`);
    }
  }
}
