import { Module } from '@nestjs/common';
import { GetAdherenceHistoryUseCase } from '../../application/adherence/use-cases/get-adherence-history.usecase';
import { ConfirmDoseUseCase } from '../../application/adherence/use-cases/confirm-dose.usecase';
import { SkipDoseUseCase } from '../../application/adherence/use-cases/skip-dose.usecase';
import { GetAdherenceStatsUseCase } from '../../application/adherence/use-cases/get-adherence-stats.usecase';
import { AdherenceStatsService } from '../../domain/adherence/services/adherence-stats.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SupabaseAdherenceRepository } from '../../infrastructure/adherence/repositories/supabase-adherence.repository';
import { AdherenceController } from './http/controllers/adherence.controller';

@Module({
  controllers: [AdherenceController],
  providers: [
    PrismaService,
    GetAdherenceHistoryUseCase,
    ConfirmDoseUseCase,
    SkipDoseUseCase,
    GetAdherenceStatsUseCase,
    AdherenceStatsService,
    {
      provide: 'AdherenceRepository',
      useClass: SupabaseAdherenceRepository,
    },
  ],
})
export class AdherenceModule {}
