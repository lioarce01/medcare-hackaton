import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { MedicationModule } from './interfaces/medication/medication.module';
import { AdherenceModule } from './interfaces/adherence/adherence.module';
import { UserModule } from './interfaces/user/user.module';
import { ReminderModule } from './interfaces/reminder/reminder.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UserModule,
    MedicationModule,
    AdherenceModule,
    ReminderModule,
  ],
})
export class AppModule {}
