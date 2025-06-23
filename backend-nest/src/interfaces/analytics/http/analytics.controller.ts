import { BadRequestException, Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { GetLatestRiskScoreUseCase } from "src/application/analytics/use-cases/get-latest-risk-score.usecase";
import { GetRiskHistoryByUserMedicationUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user-medication.usecase";
import { GetRiskHistoryByUserUseCase } from "src/application/analytics/use-cases/get-risk-history-by-user.usecase";
import { GetRiskPredictionsUseCase } from "src/application/analytics/use-cases/get-risk-predictions.usecase";
import { Request } from 'express';
import { AnalyticsPresenter } from 'src/domain/analytics/presenters/analytics.presenter';
import { JwtAuthGuard } from "src/interfaces/common/guards/jwt-auth.guard";
import { GetUserId } from "src/interfaces/common/decorators/get-user-id.decorator";
import { validate as isUuid } from 'uuid';
import { PaginationDto } from "src/interfaces/common/dto/pagination.dto";

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
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = pagination ?? {}

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const result = await this.getRiskHistoryByUserUseCase.execute(userId, startDate, endDate, page, limit);
    return {
      data: AnalyticsPresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total
    }
  }

  @Get('risk-history/:medicationId')
  @UseGuards(JwtAuthGuard)
  async getRiskHistoryByUserMedication(
    @GetUserId() userId: string,
    @Param('medicationId') medicationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query() pagination?: PaginationDto
  ) {
    const { page = 1, limit = 10 } = pagination ?? {}

    // Backend-side UUID validation
    if (!isUuid(medicationId)) {
      return { error: 'Invalid medicationId' };
    }

    const result = await this.getRiskHistoryByUserMedicationUseCase.execute(userId, medicationId, startDate, endDate, page, limit);
    return {
      data: AnalyticsPresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total
    }
  }

  @Get('risk-score/latest/:medicationId')
  @UseGuards(JwtAuthGuard)
  async getLatestRiskScore(
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