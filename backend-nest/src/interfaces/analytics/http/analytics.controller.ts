import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { GetLatestRiskScoreUseCase } from "src/application/analytics/use-cases/get-latest-risk-score.usecase";
import { GetRiskHistoryByUserMedicationUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user-medication.usecase";
import { GetRiskHistoryByUserUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user.usecase";
import { GetRiskPredictionsUseCase } from "src/application/analytics/use-cases/get-risk-predictions.usecase";
import { Request } from 'express';
import { AnalyticsPresenter } from 'src/domain/analytics/presenters/analytics.presenter';
import { JwtAuthGuard } from "src/interfaces/common/guards/jwt-auth.guard";
import { GetUserId } from "src/interfaces/common/decorators/get-user-id.decorator";
import { validate as isUuid } from 'uuid';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getRiskHistoryByUserMedicationUseCase: GetRiskHistoryByUserMedicationUseCase,
    private readonly getRiskHistoryByUserUseCase: GetRiskHistoryByUserUseCase,
    private readonly getLatestRiskScoreUseCase: GetLatestRiskScoreUseCase,
    private readonly getRiskPredictionsUseCase: GetRiskPredictionsUseCase,
  ) { }

  @Get('risk-history/user')
  @UseGuards(JwtAuthGuard)
  async getRiskHistoryByUser(
    @Req() req: Request,
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    console.log('getRiskHistoryByUser', { userId, startDate, endDate });
    const result = await this.getRiskHistoryByUserUseCase.execute(userId, startDate, endDate);
    return AnalyticsPresenter.toHttpList(result);
  }

  @Get('risk-history/:medicationId')
  @UseGuards(JwtAuthGuard)
  async getRiskHistoryByUserMedication(
    @Req() req: Request,
    @GetUserId() userId: string,
    @Param('medicationId') medicationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Backend-side UUID validation
    if (!isUuid(medicationId)) {
      return { error: 'Invalid medicationId' };
    }
    console.log('getRiskHistoryByUserMedication', { userId, medicationId, startDate, endDate });
    const result = await this.getRiskHistoryByUserMedicationUseCase.execute(userId, medicationId, startDate, endDate);
    return AnalyticsPresenter.toHttpList(result);
  }

  @Get('risk-score/latest/:medicationId')
  @UseGuards(JwtAuthGuard)
  async getLatestRiskScore(
    @Req() req: Request,
    @GetUserId() userId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return { risk_score: await this.getLatestRiskScoreUseCase.execute(userId, medicationId) };
  }

  @Get('risks')
  @UseGuards(JwtAuthGuard)
  async getRiskPredictions(@GetUserId() userId: string) {
    // Call the use case to get risk predictions
    return await this.getRiskPredictionsUseCase.execute(userId);
  }
}