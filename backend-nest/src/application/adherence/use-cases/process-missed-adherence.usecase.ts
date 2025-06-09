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
    @Inject('AdherenceRepository') private readonly adherenceRepository: AdherenceRepository,
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
      // 1. Get pending records from previous days
      const pendingRecords = await this.adherenceRepository.findPendingBeforeDate(todayStr);
      
      // 2. Get pending records from today that passed cutoff time
      const todayPending = await this.adherenceRepository.findPendingByDate(todayStr);
      
      // Filter today's records that passed the cutoff time
      const skippedToday = todayPending.filter(record => {
        const [h, m] = record.scheduled_time.split(':').map(Number);
        const scheduledDateTime = new Date(record.scheduled_date);
        scheduledDateTime.setHours(h, m, 0, 0);
        return scheduledDateTime < cutoffTime;
      });

      // Combine all records to be marked as missed
      const allMissedRecords = [...pendingRecords, ...skippedToday];
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

      console.log(`Processed missed adherence: ${processed} total, ${updated} updated, ${failed} failed`);
      
      return { processed, updated, failed };
    } catch (error) {
      console.error('Error in process missed adherence:', error);
      throw error;
    }
  }
}
