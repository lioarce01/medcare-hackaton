import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderController } from './http/controllers/reminder.controller';
import { SupabaseReminderRepository } from '../../infrastructure/reminder/repositories/supabase-reminder.repository';
import { SendGridNotificationService } from '../../infrastructure/reminder/services/sendgrid-notification.service';
import { ReminderSchedulerService } from '../../infrastructure/reminder/services/reminder-scheduler.service';
import { ReminderGenerationService } from '../../domain/reminder/services/reminder-generation.service';
import { CreateReminderUseCase } from '../../application/reminder/use-cases/create-reminder.usecase';
import { GetUpcomingRemindersUseCase } from '../../application/reminder/use-cases/get-upcoming-reminders.usecase';
import { GetAllRemindersUseCase } from '../../application/reminder/use-cases/get-all-reminders.usecase';
import { SendReminderManuallyUseCase } from '../../application/reminder/use-cases/send-reminder-manually.usecase';
import { DeleteReminderUseCase } from '../../application/reminder/use-cases/delete-reminder.usecase';
import { UpdateReminderSettingsUseCase } from '../../application/reminder/use-cases/update-reminder-settings.usecase';
import { GetUserSettingsUseCase } from '../../application/reminder/use-cases/get-user-settings.usecase';
import { ScheduleRemindersUseCase } from '../../application/reminder/use-cases/schedule-reminders.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SupabaseUserRepository } from '../../infrastructure/user/repositories/supabase-user.repository';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ScheduleModule.forRoot(), SubscriptionModule, UserModule],
  controllers: [ReminderController],
  providers: [
    PrismaService,
    ReminderGenerationService,
    ReminderSchedulerService,
    CreateReminderUseCase,
    GetUpcomingRemindersUseCase,
    GetAllRemindersUseCase,
    SendReminderManuallyUseCase,
    DeleteReminderUseCase,
    UpdateReminderSettingsUseCase,
    GetUserSettingsUseCase,
    ScheduleRemindersUseCase,
    {
      provide: 'ReminderRepository',
      useClass: SupabaseReminderRepository,
    },
    {
      provide: 'NotificationService',
      useClass: SendGridNotificationService,
    },
  ],
  exports: [
    ReminderGenerationService,
    'ReminderRepository',
    'NotificationService',
  ],
})
export class ReminderModule { }
