import { Injectable, Inject } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';

export interface ProcessMissedAdherenceResult {
  processed: number;
  updated: number;
  failed: number;
}

@Injectable()
export class ProcessMissedAdherenceUseCase {
  constructor(
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
  ) {}

  async execute(): Promise<ProcessMissedAdherenceResult> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Create cutoff time (2 hours ago)
    const cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    let processed = 0;
    let updated = 0;
    let failed = 0;

    try {
      // Get all pending records that should be marked as missed
      const allMissedRecords =
        await this.adherenceRepository.findPendingForMissedProcessing(
          todayStr,
          cutoffTime,
        );

      processed = allMissedRecords.length;

      // Update each record to 'missed' status
      for (const record of allMissedRecords) {
        try {
          await this.adherenceRepository.updateStatus(record.id, 'missed');
          updated++;
        } catch (error) {
          console.error(`Error updating adherence record ${record.id}:`, error);
          failed++;
        }
      }

      console.log(
        `Processed missed adherence: ${processed} total, ${updated} updated, ${failed} failed`,
      );

      return { processed, updated, failed };
    } catch (error) {
      console.error('Error in process missed adherence:', error);
      throw error;
    }
  }
}
