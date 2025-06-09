import { Injectable } from '@nestjs/common';
import { Adherence } from '../entities/adherence.entity';
import { Medication } from '../../medication/entities/medication.entity';
import { DateCalculationService } from './date-calculation.service';
import { v4 as uuidv4 } from 'uuid';

export interface AdherenceGenerationData {
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  scheduled_date: Date;
  user_timezone?: string;
  status: string;
}

@Injectable()
export class AdherenceGenerationService {
  constructor(private readonly dateCalculationService: DateCalculationService) {}

  /**
   * Generate adherence records for a newly created medication
   */
  generateAdherenceRecords(
    medication: Medication,
    userTimezone: string = 'UTC',
  ): Adherence[] {
    const adherenceRecords: Adherence[] = [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure scheduled times are in 24-hour format
    const localScheduledTimes = medication.scheduled_times.map((time) =>
      this.dateCalculationService.ensure24HourFormat(time),
    );

    // Convert local times to UTC for storage
    const utcScheduledTimes = localScheduledTimes.map((time: string) =>
      this.dateCalculationService.convertLocalTimeToUTC(time, userTimezone),
    );

    // If medication has specific days (e.g., "every Thursday")
    if (
      medication.frequency.specific_days &&
      medication.frequency.specific_days.length > 0
    ) {
      // For each specific day, create an adherence record starting from the next occurrence
      for (const day of medication.frequency.specific_days) {
        for (let i = 0; i < localScheduledTimes.length; i++) {
          const localTime = localScheduledTimes[i];
          const utcTime = utcScheduledTimes[i];
          const nextDate = this.dateCalculationService.getNextOccurrence(
            day,
            localTime,
          );

          // Create adherence record with the properly converted UTC time
          const adherenceData: AdherenceGenerationData = {
            user_id: medication.user_id,
            medication_id: medication.id,
            scheduled_time: utcTime, // This now contains the correct UTC time
            scheduled_date: nextDate,
            user_timezone: userTimezone,
            status: 'pending',
          };

          adherenceRecords.push(this.createAdherenceEntity(adherenceData));

          // If the next occurrence is today and different from the calculated next date
          const todayOccurrence = new Date(today);
          const [hours, minutes] = localTime.split(':').map(Number);
          todayOccurrence.setHours(hours, minutes, 0, 0);

          if (
            nextDate.toDateString() !== today.toDateString() &&
            todayOccurrence > now &&
            todayOccurrence.getDay() === today.getDay()
          ) {
            const todayAdherenceData: AdherenceGenerationData = {
              user_id: medication.user_id,
              medication_id: medication.id,
              scheduled_time: utcTime,
              scheduled_date: today,
              user_timezone: userTimezone,
              status: 'pending',
            };

            adherenceRecords.push(this.createAdherenceEntity(todayAdherenceData));
          }
        }
      }
    } else {
      // For daily medications, create records starting from the next occurrence
      for (let i = 0; i < localScheduledTimes.length; i++) {
        const localTime = localScheduledTimes[i];
        const utcTime = utcScheduledTimes[i];
        const nextDate = this.dateCalculationService.getNextDailyOccurrence(
          localTime,
        );

        // Create adherence record with the properly converted UTC time
        const adherenceData: AdherenceGenerationData = {
          user_id: medication.user_id,
          medication_id: medication.id,
          scheduled_time: utcTime, // This now contains the correct UTC time
          scheduled_date: nextDate,
          user_timezone: userTimezone,
          status: 'pending',
        };

        adherenceRecords.push(this.createAdherenceEntity(adherenceData));
      }
    }

    return adherenceRecords;
  }

  /**
   * Create an Adherence entity from generation data
   */
  private createAdherenceEntity(data: AdherenceGenerationData): Adherence {
    return new Adherence(
      uuidv4(), // Generate new UUID
      data.user_id,
      data.medication_id,
      data.scheduled_time,
      data.scheduled_date,
      null, // taken_time
      data.status,
      null, // notes
      false, // reminder_sent
      [], // side_effects_reported
      null, // dosage_taken
      new Date(), // created_at
      new Date(), // updated_at
    );
  }
}
