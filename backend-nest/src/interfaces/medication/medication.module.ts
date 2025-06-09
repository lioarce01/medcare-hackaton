import { Module } from '@nestjs/common';
import { MedicationController } from './http/controllers/medication.controller';
import { SupabaseMedicationRepository } from '../../infrastructure/medication/repositories/supabase-medication.repository';
import { CreateMedicationUseCase } from '../../application/medication/use-cases/create-medication.usecase';
import { CreateMedicationWithAdherenceUseCase } from '../../application/medication/use-cases/create-medication-with-adherence.usecase';
import { UpdateMedicationUseCase } from '../../application/medication/use-cases/update-medication.usecase';
import { DeleteMedicationUseCase } from '../../application/medication/use-cases/delete-medication.usecase';
import { FindMedicationByIdUseCase } from '../../application/medication/use-cases/find-medication-by-id.usecase';
import { FindMedicationByUserUseCase } from '../../application/medication/use-cases/find-medication-by-user.usecase';
import { FindActiveMedicationByUserUseCase } from '../../application/medication/use-cases/find-active-medication-by-user.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SupabaseAdherenceRepository } from '../../infrastructure/adherence/repositories/supabase-adherence.repository';
import { AdherenceGenerationService } from '../../domain/adherence/services/adherence-generation.service';
import { DateCalculationService } from '../../domain/adherence/services/date-calculation.service';
import { CreateRemindersForMedicationUseCase } from '../../application/reminder/use-cases/create-reminders-for-medication.usecase';
import { SupabaseReminderRepository } from '../../infrastructure/reminder/repositories/supabase-reminder.repository';
import { ReminderGenerationService } from '../../domain/reminder/services/reminder-generation.service';

@Module({
  controllers: [MedicationController],
  providers: [
    PrismaService,
    CreateMedicationUseCase,
    CreateMedicationWithAdherenceUseCase,
    UpdateMedicationUseCase,
    DeleteMedicationUseCase,
    FindMedicationByIdUseCase,
    FindMedicationByUserUseCase,
    FindActiveMedicationByUserUseCase,
    AdherenceGenerationService,
    DateCalculationService,
    CreateRemindersForMedicationUseCase,
    ReminderGenerationService,
    {
      provide: 'MedicationRepository',
      useClass: SupabaseMedicationRepository,
    },
    {
      provide: 'AdherenceRepository',
      useClass: SupabaseAdherenceRepository,
    },
    {
      provide: 'ReminderRepository',
      useClass: SupabaseReminderRepository,
    },
  ],
})
export class MedicationModule {}
