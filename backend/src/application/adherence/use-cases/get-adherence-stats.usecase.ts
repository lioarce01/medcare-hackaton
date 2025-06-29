import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { AdherenceStats } from '../../../domain/adherence/entities/adherence-stats.entity';
import { AdherenceStatsService } from '../../../domain/adherence/services/adherence-stats.service';
import { DateTime } from 'luxon';

@Injectable()
export class GetAdherenceStatsUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    private readonly adherenceStatsService: AdherenceStatsService,
  ) { }

  private async getStatsForRange(
    userId: string,
    startDate: DateTime,
    endDate: DateTime,
    timezone: string,
  ): Promise<AdherenceStats> {
    // Fetch a potentially wider range from DB in UTC
    const rawData = await this.adherenceRepository.getStats(
      userId,
      startDate,
      endDate,
      timezone,
    );
    // Process and filter raw data based on local time range
    return this.adherenceStatsService.processStats(rawData);
  }

  async execute(userId: string, timezone?: string): Promise<{
    today: AdherenceStats;
    week: AdherenceStats;
    month: AdherenceStats;
    ranking: AdherenceStats['ranking'];
  }> {
    // Usar la zona horaria del usuario o UTC por defecto
    const userTz = timezone || 'UTC';
    const now = DateTime.now().setZone(userTz);

    // Hoy en zona del usuario
    const startToday = now.startOf('day');
    const endToday = now;

    // Semana: desde el lunes en zona del usuario
    const startWeek = now.startOf('week'); // Luxon: lunes
    // const endWeek = now;

    // Mes: desde el 1ro en zona del usuario
    const startMonth = now.startOf('month');
    // const endMonth = now;

    // Convertir a UTC ISO YYYY-MM-DD
    const formatDate = (dt: DateTime) => dt.toUTC().toISODate() || dt.toUTC().toFormat('yyyy-MM-dd');

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getStatsForRange(
        userId,
        startToday,
        endToday,
        userTz,
      ),
      this.getStatsForRange(
        userId,
        startWeek,
        endToday,
        userTz,
      ),
      this.getStatsForRange(
        userId,
        startMonth,
        endToday,
        userTz,
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
