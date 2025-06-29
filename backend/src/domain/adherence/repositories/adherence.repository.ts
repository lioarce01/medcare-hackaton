import { Adherence } from '../entities/adherence.entity';
import { AdherenceStatsRaw } from '../entities/adherence-stats.entity';
import { DateTime } from 'luxon'; // Importar DateTime

export interface AdherenceRepository {
  create(adherence: Adherence): Promise<Adherence>;
  update(adherence: Adherence): Promise<Adherence>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Adherence | null>;
  findByUser(userId: string, page?: number, limit?: number): Promise<{
    data: Adherence[];
    page: number;
    limit: number;
    total: number;
  }>;
  findActiveByUser(userId: string, page?: number, limit?: number): Promise<{
    data: Adherence[];
    page: number;
    limit: number;
    total: number;
  }>;

  // New methods based on frontend requirements
  getHistory(userId: string, page?: number, limit?: number, date?: string): Promise<{
    data: Adherence[];
    page: number;
    limit: number;
    total: number;
  }>;
  confirmDose(adherenceId: string, userId: string): Promise<Adherence>;
  skipDose(adherenceId: string, userId: string): Promise<Adherence>;
  getStats(
    userId: string,
    startDate: DateTime, // Cambiado a DateTime
    endDate: DateTime, // Cambiado a DateTime
    timezone: string, // Agregado timezone
  ): Promise<AdherenceStatsRaw[]>;
  getTimeline(userId: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<{
    data: Adherence[];
    page: number;
    limit: number;
    total: number;
  }>;

  // Methods for cron jobs
  findPendingForMissedProcessing(
    todayStr: string,
    cutoffTime: Date,
  ): Promise<Adherence[]>;
  findByUserMedicationDateRange(
    userId: string,
    medicationId: string,
    startDatetime: string,
    endDatetime: string,
  ): Promise<Adherence[]>;
  updateStatus(adherenceId: string, status: string): Promise<void>;
  exists(
    userId: string,
    medicationId: string,
    scheduledDatetime: string | Date,
  ): Promise<boolean>;
}
