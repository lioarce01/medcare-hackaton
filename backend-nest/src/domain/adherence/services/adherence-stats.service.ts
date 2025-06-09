import { Injectable } from '@nestjs/common';
import {
  AdherenceStats,
  AdherenceStatsRaw,
  MedicationStats,
} from '../entities/adherence-stats.entity';

@Injectable()
export class AdherenceStatsService {
  /**
   * Process raw adherence data into structured statistics
   */
  processStats(rawData: AdherenceStatsRaw[]): AdherenceStats {
    const stats: AdherenceStats = {
      total: rawData.length,
      taken: 0,
      missed: 0,
      skipped: 0,
      pending: 0,
      adherenceRate: 0,
      byMedication: {},
    };

    // Count overall stats
    rawData.forEach((record) => {
      switch (record.status) {
        case 'taken':
          stats.taken++;
          break;
        case 'missed':
          stats.missed++;
          break;
        case 'skipped':
          stats.skipped++;
          break;
        case 'pending':
        default:
          stats.pending++;
          break;
      }
    });

    // Calculate adherence rate (excluding pending doses)
    const completedDoses = stats.taken + stats.missed + stats.skipped;
    stats.adherenceRate =
      completedDoses > 0 ? (stats.taken / completedDoses) * 100 : 0;

    // Process medication-specific stats
    rawData.forEach((record) => {
      const medId = record.medication.id;
      
      if (!stats.byMedication[medId]) {
        stats.byMedication[medId] = {
          id: medId,
          name: record.medication.name,
          total: 0,
          taken: 0,
          missed: 0,
          skipped: 0,
          pending: 0,
        };
      }

      const medStats = stats.byMedication[medId];
      medStats.total++;

      switch (record.status) {
        case 'taken':
          medStats.taken++;
          break;
        case 'missed':
          medStats.missed++;
          break;
        case 'skipped':
          medStats.skipped++;
          break;
        case 'pending':
        default:
          medStats.pending++;
          break;
      }
    });

    return stats;
  }

  /**
   * Get default date range (last 30 days)
   */
  getDefaultDateRange(): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }
}
