import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DateCalculationService {
  /**
   * Get the next occurrence for a specific day of the week
   */
  getNextOccurrence(targetDay: string, scheduledTime: string): Date {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const now = new Date();
    const targetDayIndex = days.indexOf(targetDay.toLowerCase());
    const currentDayIndex = now.getDay();

    // Parse the scheduled time (in local time)
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If it's the same day and the time hasn't passed yet, use today
    if (targetDayIndex === currentDayIndex && scheduledDate > now) {
      return scheduledDate;
    }

    // Otherwise, calculate next occurrence
    let daysUntilNext = targetDayIndex - currentDayIndex;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7; // Move to next week
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilNext);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }

  /**
   * Get next occurrence for daily medications
   */
  getNextDailyOccurrence(scheduledTime: string): Date {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If the time hasn't passed yet today, use today
    if (scheduledDate > now) {
      return scheduledDate;
    }

    // Otherwise, use tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  }

  /**
   * Ensure time is in 24-hour format
   */
  ensure24HourFormat(time: string): string {
    // If already in 24-hour format, return as is
    if (time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }

    // Convert from 12-hour to 24-hour format
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':');
    let hour24 = parseInt(hours);

    if (period?.toLowerCase() === 'pm' && hour24 !== 12) {
      hour24 += 12;
    } else if (period?.toLowerCase() === 'am' && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  }

  /**
   * Convert local time to UTC (simplified version)
   * In a real implementation, you'd use a proper timezone library like date-fns-tz
   */

  convertLocalTimeToUTC(
    localTime: string,
    timezone: string,
    localDate: Date,
  ): Date {
    const [hours, minutes] = localTime.split(':').map(Number);

    // Construir DateTime con la fecha y hora local en la zona horaria del usuario
    const localDateTime = DateTime.fromJSDate(localDate, {
      zone: timezone,
    }).set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });

    // Convertir a UTC y devolver como objeto Date
    return localDateTime.toUTC().toJSDate();
  }

  /**
   * Format date to UTC string
   */
  formatUTCDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
