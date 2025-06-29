import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MedicationModule } from './interfaces/medication/medication.module';
import { AdherenceModule } from './interfaces/adherence/adherence.module';
import { UserModule } from './interfaces/user/user.module';
import { ReminderModule } from './interfaces/reminder/reminder.module';
import { SubscriptionModule } from './interfaces/subscription/subscription.module';
import { SchedulerModule } from './interfaces/scheduler/scheduler.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { AnalyticsModule } from './interfaces/analytics/analytics.module';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UserModule,
    MedicationModule,
    AdherenceModule,
    ReminderModule,
    SubscriptionModule,
    SchedulerModule,
    AnalyticsModule
  ],
})
export class AppModule { }
