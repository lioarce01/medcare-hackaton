import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { NotificationService } from 'src/domain/reminder/services/notification.service';
import { UserRepository } from 'src/domain/user/repositories/user.repository';

@Injectable()
export class ScheduleRemindersUseCase {
  private readonly logger = new Logger(ScheduleRemindersUseCase.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('NotificationService')
    private readonly notificationService: NotificationService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<{ processed: number; sent: number; failed: number }> {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const futureTime = fiveMinutesFromNow.toTimeString().slice(0, 5);

    this.logger.log(`Checking reminders for ${today} between ${currentTime} and ${futureTime}`);

    // Get pending reminders for the next 5 minutes
    const reminders = await this.reminderRepository.findPendingReminders(
      undefined, // all users
      today,
      currentTime,
      futureTime
    );

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
      try {
        processed++;

        // Check if user is premium
        const user = await this.userRepository.findById(reminder.user_id);
        if (!user) {
          this.logger.warn(`User ${reminder.user_id} not found, skipping reminder`);
          continue;
        }

        const isPremium = user.subscription_status === 'premium' && 
                         user.subscription_expires_at && 
                         new Date(user.subscription_expires_at) > new Date();

        if (!isPremium) {
          this.logger.log(`User ${reminder.user_id} is not premium, skipping reminder`);
          continue;
        }

        // Send reminder via email
        await this.notificationService.sendEmailReminder(reminder);

        // Mark as sent
        await this.reminderRepository.markAsSent(reminder.id, 'email');
        
        sent++;
        this.logger.log(`Reminder sent successfully for user ${reminder.user_id}, medication ${reminder.medication?.name}`);

      } catch (error) {
        failed++;
        this.logger.error(`Error processing reminder ${reminder.id}:`, error);
        
        try {
          await this.reminderRepository.markAsFailed(reminder.id);
        } catch (updateError) {
          this.logger.error(`Error marking reminder as failed:`, updateError);
        }
      }
    }

    this.logger.log(`Reminder processing complete: ${processed} processed, ${sent} sent, ${failed} failed`);
    
    return { processed, sent, failed };
  }
}
