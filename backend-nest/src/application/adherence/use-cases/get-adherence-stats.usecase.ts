import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { AdherenceStats } from '../../../domain/adherence/entities/adherence-stats.entity';
import { AdherenceStatsService } from '../../../domain/adherence/services/adherence-stats.service';

@Injectable()
export class GetAdherenceStatsUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceStatsService: AdherenceStatsService,
  ) {}

  private async getStatsForRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<AdherenceStats> {
    const rawData = await this.adherenceRepository.getStats(
      userId,
      startDate,
      endDate,
    );
    return this.adherenceStatsService.processStats(rawData);
  }

  async execute(userId: string): Promise<{
    today: AdherenceStats;
    week: AdherenceStats;
    month: AdherenceStats;
    ranking: AdherenceStats['ranking'];
  }> {
    const now = new Date();

    // Today: desde el inicio del día hasta ahora
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const endToday = now;

    // Week: desde el lunes (inicio de la semana) hasta ahora
    const startWeek = new Date(now);
    const dayOfWeek = startWeek.getDay(); // domingo=0 ... sábado=6
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // ajusta domingo a lunes
    startWeek.setDate(startWeek.getDate() - diffToMonday);
    startWeek.setHours(0, 0, 0, 0);
    const endWeek = now;

    // Month: desde el 1ro del mes hasta ahora
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startMonth.setHours(0, 0, 0, 0);
    const endMonth = now;

    // Formatear fechas a ISO YYYY-MM-DD para el repositorio
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Obtener stats para cada rango
    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getStatsForRange(
        userId,
        formatDate(startToday),
        formatDate(endToday),
      ),
      this.getStatsForRange(userId, formatDate(startWeek), formatDate(endWeek)),
      this.getStatsForRange(
        userId,
        formatDate(startMonth),
        formatDate(endMonth),
      ),
    ]);

    return {
      today: todayStats,
      week: weekStats,
      month: monthStats,
      ranking: this.adherenceStatsService.getRanking(monthStats.adherenceRate),
    };
  }
}
