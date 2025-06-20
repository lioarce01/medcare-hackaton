import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ConfirmDoseUseCase } from 'src/application/adherence/use-cases/confirm-dose.usecase';
import { GetAdherenceHistoryUseCase } from 'src/application/adherence/use-cases/get-adherence-history.usecase';
import { SkipDoseUseCase } from 'src/application/adherence/use-cases/skip-dose.usecase';
import { GetAdherenceStatsUseCase } from 'src/application/adherence/use-cases/get-adherence-stats.usecase';
import { GetUserId } from 'src/interfaces/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/interfaces/common/guards/jwt-auth.guard';
import { AdherencePresenter } from 'src/domain/adherence/presenters/adherence.presenter';
import { ConfirmDoseDto } from 'src/interfaces/adherence/dtos/confirm-dose.dto';
import { GetAdherenceHistoryDto } from 'src/interfaces/adherence/dtos/get-adherence-history.dto';
import { SkipDoseDto } from 'src/interfaces/adherence/dtos/skip-dose.dto';
import { GetAdherenceStatsDto } from 'src/interfaces/adherence/dtos/get-adherence-stats.dto';
import { SubscriptionGuard } from 'src/interfaces/common/guards/subscription.guard';
import { get } from 'http';

@Controller('adherence')
export class AdherenceController {
  constructor(
    private readonly getAdherenceHistoryUseCase: GetAdherenceHistoryUseCase,
    private readonly confirmDoseUseCase: ConfirmDoseUseCase,
    private readonly skipDoseUseCase: SkipDoseUseCase,
    private readonly getAdherenceStatsUseCase: GetAdherenceStatsUseCase,
  ) { }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Query() query: GetAdherenceHistoryDto,
    @GetUserId() userId: string,
  ) {
    console.log('UserId:', userId);
    console.log('Query date:', query.date);

    const adherences = await this.getAdherenceHistoryUseCase.execute(
      userId,
      query.date,
    );
    console.log('Adherences found:', adherences.length);

    return AdherencePresenter.toHttpList(adherences);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmDose(@Body() body: ConfirmDoseDto, @GetUserId() userId: string) {
    console.log('confirmDose body:', body);

    const adherence = await this.confirmDoseUseCase.execute(
      body.adherenceId,
      userId,
    );
    return AdherencePresenter.toHttp(adherence);
  }

  @Post('skip')
  @UseGuards(JwtAuthGuard)
  async skipDose(@Body() body: SkipDoseDto, @GetUserId() userId: string) {
    const adherence = await this.skipDoseUseCase.execute(
      body.adherenceId,
      userId,
    );
    return AdherencePresenter.toHttp(adherence);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard) // todo: addcheck subscription guard
  async getStats(
    @Query() query: GetAdherenceStatsDto,
    @GetUserId() userId: string,
  ) {
    // Pasar timezone al usecase
    return await this.getAdherenceStatsUseCase.execute(userId, query.timezone);
  }
}
