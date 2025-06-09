import { Module } from '@nestjs/common';
import { MedicationController } from './interfaces/medication/http/controllers/medication.controller';
import { SupabaseMedicationRepository } from './infrastructure/medication/repositories/supabase-medication.repository';
import { CreateMedicationUseCase } from './application/medication/use-cases/create-medication.usecase';
import { UpdateMedicationUseCase } from './application/medication/use-cases/update-medication.usecase';
import { DeleteMedicationUseCase } from './application/medication/use-cases/delete-medication.usecase';
import { FindMedicationByIdUseCase } from './application/medication/use-cases/find-medication-by-id.usecase';
import { FindMedicationByUserUseCase } from './application/medication/use-cases/find-medication-by-user.usecase';
import { FindActiveMedicationByUserUseCase } from './application/medication/use-cases/find-active-medication-by-user.usecase';

@Module({
  controllers: [MedicationController],
  providers: [
    CreateMedicationUseCase,
    UpdateMedicationUseCase,
    DeleteMedicationUseCase,
    FindMedicationByIdUseCase,
    FindMedicationByUserUseCase,
    FindActiveMedicationByUserUseCase,
    {
      provide: 'MedicationRepository',
      useClass: SupabaseMedicationRepository,
    },
  ],
})
export class MedicationModule {}
