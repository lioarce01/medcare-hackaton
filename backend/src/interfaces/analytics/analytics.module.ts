import { Module } from "@nestjs/common";
import { CalculateDailyRiskScoresUseCase } from "src/application/analytics/use-cases/calculate-daily-risk-scores.usecase";
import { SupabaseAnalyticsRepository } from "src/infrastructure/analytics/repositories/supabase-analytics.repository";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { AnalyticsController } from "./http/analytics.controller";
import { UserModule } from "../user/user.module";
import { MedicationModule } from "../medication/medication.module";
import { AdherenceModule } from "../adherence/adherence.module";
import { GetRiskHistoryByUserMedicationUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user-medication.usecase";
import { GetRiskHistoryByUserUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user.usecase";
import { GetLatestRiskScoreUseCase } from "src/application/analytics/use-cases/get-latest-risk-score.usecase";
import { GetRiskPredictionsUseCase } from "src/application/analytics/use-cases/get-risk-predictions.usecase";

@Module({
  imports: [UserModule, MedicationModule, AdherenceModule],
  controllers: [AnalyticsController],
  providers: [
    CalculateDailyRiskScoresUseCase,
    GetRiskHistoryByUserMedicationUseCase,
    GetRiskHistoryByUserUseCase,
    GetLatestRiskScoreUseCase,
    GetRiskPredictionsUseCase,
    PrismaService,
    {
      provide: 'RiskHistoryRepository',
      useClass: SupabaseAnalyticsRepository,
    },
  ],
  exports: [CalculateDailyRiskScoresUseCase]
})
export class AnalyticsModule { }