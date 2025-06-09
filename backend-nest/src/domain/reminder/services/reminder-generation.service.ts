import { Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { CreateReminderDto } from 'src/infrastructure/reminder/dtos/create-reminder.dto';

@Injectable()
export class ReminderGenerationService {
  generateRemindersForMedication(
    medication: Medication,
    userTimezone: string = 'UTC',
    daysAhead: number = 7
  ): CreateReminderDto[] {
    const reminders: CreateReminderDto[] = [];
    const startDate = new Date();
    
    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayOffset);
      
      // Check if medication should be taken on this day
      if (this.shouldTakeMedicationOnDay(medication, currentDate)) {
        // Generate reminders for each scheduled time
        for (const scheduledTime of medication.scheduled_times) {
          const reminder: CreateReminderDto = {
            user_id: medication.user_id,
            medication_id: medication.id,
            scheduled_time: scheduledTime,
            scheduled_date: currentDate.toISOString().split('T')[0],
            status: 'pending',
            channels: {
              email: { enabled: true, sent: false },
              sms: { enabled: false, sent: false }
            },
            message: this.generateReminderMessage(medication),
            retry_count: 0,
          };
          
          reminders.push(reminder);
        }
      }
    }
    
    return reminders;
  }

  private shouldTakeMedicationOnDay(medication: Medication, date: Date): boolean {
    // Check if medication is active
    if (!medication.active) return false;
    
    // Check start date
    if (medication.start_date && date < medication.start_date) return false;
    
    // Check end date
    if (medication.end_date && date > medication.end_date) return false;
    
    // Check frequency
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (medication.frequency.specific_days && medication.frequency.specific_days.length > 0) {
      // Specific days medication
      return medication.frequency.specific_days.includes(dayOfWeek);
    } else {
      // Daily medication
      return true;
    }
  }

  private generateReminderMessage(medication: Medication): string {
    const dosage = typeof medication.dosage === 'object' 
      ? `${medication.dosage.amount} ${medication.dosage.unit}`
      : medication.dosage;
    
    return `Time to take ${medication.name} - ${dosage}`;
  }

  generateSingleReminder(
    userId: string,
    medicationId: string,
    scheduledTime: string,
    scheduledDate: string,
    message?: string
  ): CreateReminderDto {
    return {
      user_id: userId,
      medication_id: medicationId,
      scheduled_time: scheduledTime,
      scheduled_date: scheduledDate,
      status: 'pending',
      channels: {
        email: { enabled: true, sent: false },
        sms: { enabled: false, sent: false }
      },
      message: message || 'Time to take your medication',
      retry_count: 0,
    };
  }
}
