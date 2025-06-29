import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleRemindersUseCase } from 'src/application/reminder/use-cases/schedule-reminders.usecase';

@Injectable()
export class ReminderSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    private readonly scheduleRemindersUseCase: ScheduleRemindersUseCase,
  ) {}

  onModuleInit() {
    this.logger.log('Reminder Scheduler Service initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminderCheck() {
    try {
      this.logger.log('Running reminder check job');
      const result = await this.scheduleRemindersUseCase.execute();
      this.logger.log(`Reminder job completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Error in reminder job: ${error.message}`, error.stack);
    }
  }

  // Optional: Add a manual trigger method for testing
  async triggerReminderCheck(): Promise<{ processed: number; sent: number; failed: number }> {
    this.logger.log('Manually triggering reminder check');
    return this.scheduleRemindersUseCase.execute();
  }
}
