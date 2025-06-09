import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppSchedulerService } from '../../infrastructure/scheduler/services/app-scheduler.service';
import { ProcessMissedAdherenceUseCase } from '../../application/adherence/use-cases/process-missed-adherence.usecase';
import { CalculateDailyRiskScoresUseCase } from '../../application/analytics/use-cases/calculate-daily-risk-scores.usecase';
import { GenerateWeeklyReportsUseCase } from '../../application/reports/use-cases/generate-weekly-reports.usecase';
import { SupabaseAdherenceRepository } from '../../infrastructure/adherence/repositories/supabase-adherence.repository';
import { SupabaseUserRepository } from '../../infrastructure/user/repositories/supabase-user.repository';
import { SupabaseMedicationRepository } from '../../infrastructure/medication/repositories/supabase-medication.repository';
import { SupabaseRiskHistoryRepository } from '../../infrastructure/analytics/repositories/supabase-risk-history.repository';
import { SupabaseSubscriptionRepository } from '../../infrastructure/subscription/repositories/supabase-subscription.repository';
import { SendGridNotificationService } from '../../infrastructure/reminder/services/sendgrid-notification.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PrismaService,
    AppSchedulerService,
    ProcessMissedAdherenceUseCase,
    CalculateDailyRiskScoresUseCase,
    GenerateWeeklyReportsUseCase,
    {
      provide: 'AdherenceRepository',
      useClass: SupabaseAdherenceRepository,
    },
    {
      provide: 'UserRepository',
      useClass: SupabaseUserRepository,
    },
    {
      provide: 'MedicationRepository',
      useClass: SupabaseMedicationRepository,
    },
    {
      provide: 'RiskHistoryRepository',
      useClass: SupabaseRiskHistoryRepository,
    },
    {
      provide: 'SubscriptionRepository',
      useClass: SupabaseSubscriptionRepository,
    },
    {
      provide: 'NotificationService',
      useClass: SendGridNotificationService,
    },
  ],
  exports: [AppSchedulerService],
})
export class SchedulerModule {}
