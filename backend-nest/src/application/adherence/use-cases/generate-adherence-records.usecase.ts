import { Injectable, Inject } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { MedicationRepository } from '../../../domain/medication/repositories/medication.repository';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { AdherenceGenerationService } from '../../../domain/adherence/services/adherence-generation.service';

export interface GenerateAdherenceRecordsResult {
  usersProcessed: number;
  medicationsProcessed: number;
  recordsGenerated: number;
  errors: number;
}

@Injectable()
export class GenerateAdherenceRecordsUseCase {
  constructor(
    @Inject('AdherenceRepository') private readonly adherenceRepository: AdherenceRepository,
    @Inject('MedicationRepository') private readonly medicationRepository: MedicationRepository,
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly adherenceGenerationService: AdherenceGenerationService,
  ) {}

  async execute(): Promise<GenerateAdherenceRecordsResult> {
    let usersProcessed = 0;
    let medicationsProcessed = 0;
    let recordsGenerated = 0;
    let errors = 0;

    try {
      // Get all users
      const users = await this.userRepository.findAll();
      
      for (const user of users) {
        try {
          usersProcessed++;
          
          // Get active medications for this user
          const medications = await this.medicationRepository.findActiveMedicationsByUser(user.id);
          
          for (const medication of medications) {
            try {
              medicationsProcessed++;
              
              // Generate adherence records for this medication
              const generated = await this.generateAdherenceForMedication(medication.id, user.id);
              recordsGenerated += generated;
              
            } catch (medError) {
              console.error(`Error generating adherence for med ${medication.id} user ${user.id}:`, medError);
              errors++;
            }
          }
        } catch (userError) {
          console.error(`Error processing user ${user.id}:`, userError);
          errors++;
        }
      }

      console.log(`Daily adherence generation completed: ${usersProcessed} users, ${medicationsProcessed} medications, ${recordsGenerated} records generated, ${errors} errors`);
      
      return { usersProcessed, medicationsProcessed, recordsGenerated, errors };
    } catch (error) {
      console.error('Error in daily adherence generation:', error);
      throw error;
    }
  }

  private async generateAdherenceForMedication(medicationId: string, userId: string): Promise<number> {
    try {
      const medication = await this.medicationRepository.findById(medicationId);
      if (!medication) {
        throw new Error('Medication not found');
      }

      // Generate adherence records for the next 7 days
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

      let recordsGenerated = 0;

      for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        // Check if medication should be taken on this day
        if (this.shouldTakeMedicationOnDay(medication, date)) {
          // Generate records for each scheduled time
          for (const timeStr of medication.scheduled_times || []) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            const scheduledDateTime = new Date(date);
            scheduledDateTime.setHours(hours, minutes, 0, 0);
            
            // Skip if the scheduled time is in the past (for today)
            const now = new Date();
            if (date.getDate() === today.getDate() && scheduledDateTime < now) {
              continue;
            }

            // Check if adherence record already exists
            const existing = await this.adherenceRepository.findByUserMedicationDateTime(
              userId,
              medicationId,
              date.toISOString().split('T')[0],
              timeStr
            );

            if (!existing) {
              // Create adherence record
              await this.adherenceRepository.create({
                user_id: userId,
                medication_id: medicationId,
                scheduled_time: timeStr,
                scheduled_date: date.toISOString().split('T')[0],
                status: 'pending'
              });
              recordsGenerated++;
            }
          }
        }
      }

      return recordsGenerated;
    } catch (error) {
      console.error('Error generating adherence records:', error);
      throw error;
    }
  }

  private shouldTakeMedicationOnDay(medication: any, date: Date): boolean {
    // Check if medication is active
    if (!medication.active) return false;
    
    // Check if within date range
    if (medication.start_date && new Date(medication.start_date) > date) return false;
    if (medication.end_date && new Date(medication.end_date) < date) return false;

    // Check frequency
    const frequency = medication.frequency;
    if (!frequency) return true; // Default to daily if no frequency specified

    if (frequency.type === 'daily') {
      return true;
    } else if (frequency.type === 'specific_days' && frequency.days) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      return frequency.days.includes(dayOfWeek);
    } else if (frequency.type === 'interval' && frequency.interval) {
      // Calculate if this date falls on the interval
      const startDate = new Date(medication.start_date || medication.created_at);
      const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff % frequency.interval === 0;
    }

    return true; // Default to true
  }
}
