import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ConfirmDoseUseCase } from 'src/application/adherence/use-cases/confirm-dose.usecase';
import { GetAdherenceHistoryUseCase } from 'src/application/adherence/use-cases/get-adherence-history.usecase';
import { SkipDoseUseCase } from 'src/application/adherence/use-cases/skip-dose.usecase';
import { GetAdherenceStatsUseCase } from 'src/application/adherence/use-cases/get-adherence-stats.usecase';
import { GetAdherenceTimelineUseCase } from 'src/application/adherence/use-cases/get-adherence-timeline.usecase';
import { GetUserId } from 'src/interfaces/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/interfaces/common/guards/jwt-auth.guard';
import { AdherencePresenter } from 'src/domain/adherence/presenters/adherence.presenter';
import { ConfirmDoseDto } from 'src/interfaces/adherence/dtos/confirm-dose.dto';
import { GetAdherenceHistoryDto } from 'src/interfaces/adherence/dtos/get-adherence-history.dto';
import { SkipDoseDto } from 'src/interfaces/adherence/dtos/skip-dose.dto';
import { GetAdherenceStatsDto } from 'src/interfaces/adherence/dtos/get-adherence-stats.dto';
import { SubscriptionGuard } from 'src/interfaces/common/guards/subscription.guard';
import { DateTime } from 'luxon';
import { PaginationDto } from 'src/interfaces/common/dto/pagination.dto';

@Controller('adherence')
export class AdherenceController {
  constructor(
    private readonly getAdherenceHistoryUseCase: GetAdherenceHistoryUseCase,
    private readonly confirmDoseUseCase: ConfirmDoseUseCase,
    private readonly skipDoseUseCase: SkipDoseUseCase,
    private readonly getAdherenceStatsUseCase: GetAdherenceStatsUseCase,
    private readonly getAdherenceTimelineUseCase: GetAdherenceTimelineUseCase,
  ) { }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @GetUserId() userId: string,
    @Query() query: GetAdherenceHistoryDto,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = pagination ?? {}
    const result = await this.getAdherenceHistoryUseCase.execute(
      userId,
      page,
      limit,
      query.date,
    );

    return {
      data: AdherencePresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total,
    }
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmDose(
    @GetUserId() userId: string,
    @Body() body: ConfirmDoseDto,
  ) {

    const adherence = await this.confirmDoseUseCase.execute(
      body.adherenceId,
      userId,
    );
    return AdherencePresenter.toHttp(adherence);
  }

  @Post('skip')
  @UseGuards(JwtAuthGuard)
  async skipDose(
    @GetUserId() userId: string,
    @Body() body: SkipDoseDto,
  ) {
    const adherence = await this.skipDoseUseCase.execute(
      body.adherenceId,
      userId,
    );
    return AdherencePresenter.toHttp(adherence);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard) // todo: addcheck subscription guard
  async getStats(
    @GetUserId() userId: string,
    @Query() query: GetAdherenceStatsDto,
  ) {
    // Pasar timezone al usecase
    return await this.getAdherenceStatsUseCase.execute(userId, query.timezone);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  async getTimeline(
    @GetUserId() userId: string,
    @Query() query: GetAdherenceHistoryDto,
    @Query() pagination?: PaginationDto,
  ) {
    if (!query.startDate || !query.endDate) {
      throw new Error('startDate and endDate are required');
    }
    const { page = 1, limit = 10 } = pagination ?? {}
    const timezone: string = (query as any).timezone || 'UTC';
    // Inclusive: start of first local day to start of day after last local day
    const startUtc = DateTime.fromISO(query.startDate, { zone: timezone }).startOf('day').toUTC().toISO() || '';
    const endUtc = DateTime.fromISO(query.endDate, { zone: timezone }).plus({ days: 1 }).startOf('day').toUTC().toISO() || '';

    const result = await this.getAdherenceTimelineUseCase.execute(
      userId,
      startUtc,
      endUtc,
      page,
      limit
    );
    return {
      data: AdherencePresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total
    }
  }
}
