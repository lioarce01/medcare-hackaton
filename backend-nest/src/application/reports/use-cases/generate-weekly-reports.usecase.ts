import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { NotificationService } from '../../../domain/reminder/services/notification.service';
import { SubscriptionRepository } from '../../../domain/subscription/repositories/subscription.repository';

export interface WeeklyReportsResult {
  usersProcessed: number;
  reportsGenerated: number;
  reportsSent: number;
  errors: number;
}

@Injectable()
export class GenerateWeeklyReportsUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('NotificationService')
    private readonly notificationService: NotificationService,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(): Promise<WeeklyReportsResult> {
    let usersProcessed = 0;
    let reportsGenerated = 0;
    let reportsSent = 0;
    let errors = 0;

    try {
      // Get all users with email notifications enabled
      const users = await this.userRepository.findUsersWithEmailNotifications();
      console.log(`Checking ${users.length} users for premium weekly reports`);

      for (const user of users) {
        try {
          usersProcessed++;

          // Check if user has premium subscription (weekly reports are premium-only)
          const subscription = await this.subscriptionRepository.findByUserId(
            user.id,
          );

          if (!subscription || !subscription.isPremium()) {
            console.log(
              `⏭️ Skipping user ${user.email} - Premium subscription required for weekly reports`,
            );
            continue;
          }

          // Generate and send weekly report for premium users only
          const success = await this.notificationService.sendWeeklyReport(
            user.id,
          );

          if (success) {
            reportsGenerated++;
            reportsSent++;
            console.log(`✅ Sent premium weekly report to ${user.email}`);
          } else {
            errors++;
            console.error(`❌ Failed to send weekly report to ${user.email}`);
          }
        } catch (userError) {
          console.error(
            `❌ Error sending report for user ${user.email}:`,
            userError,
          );
          errors++;
        }
      }

      console.log(
        `Weekly report generation completed: ${usersProcessed} users processed, ${reportsSent} reports sent, ${errors} errors`,
      );

      return { usersProcessed, reportsGenerated, reportsSent, errors };
    } catch (error) {
      console.error('Error in weekly report generation:', error);
      throw error;
    }
  }
}
