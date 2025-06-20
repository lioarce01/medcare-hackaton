import { Adherence } from '../entities/adherence.entity';
import { AdherenceStatsRaw } from '../entities/adherence-stats.entity';
import { DateTime } from 'luxon'; // Importar DateTime

export interface AdherenceRepository {
  create(adherence: Adherence): Promise<Adherence>;
  update(adherence: Adherence): Promise<Adherence>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Adherence | null>;
  findByUser(userId: string): Promise<Adherence[]>;
  findActiveByUser(userId: string): Promise<Adherence[]>;

  // New methods based on frontend requirements
  getHistory(userId: string, date?: string): Promise<Adherence[]>;
  confirmDose(adherenceId: string, userId: string): Promise<Adherence>;
  skipDose(adherenceId: string, userId: string): Promise<Adherence>;
  getStats(
    userId: string,
    startDate: DateTime, // Cambiado a DateTime
    endDate: DateTime, // Cambiado a DateTime
    timezone: string, // Agregado timezone
  ): Promise<AdherenceStatsRaw[]>;

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
