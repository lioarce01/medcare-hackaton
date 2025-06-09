import { Adherence } from '../entities/adherence.entity';
import { AdherenceStatsRaw } from '../entities/adherence-stats.entity';

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
    startDate?: string,
    endDate?: string,
  ): Promise<AdherenceStatsRaw[]>;
}
