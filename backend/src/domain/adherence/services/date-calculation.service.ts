import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DateCalculationService {
  /**
   * Get the next occurrence for a specific day of the week, en la zona horaria del usuario
   */
  getNextOccurrence(
    targetDay: string,
    scheduledTime: string,
    timezone: string,
  ): Date {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const now = DateTime.now().setZone(timezone);
    const targetDayIndex = days.indexOf(targetDay.toLowerCase());
    const currentDayIndex = now.weekday % 7; // Luxon: 1=Monday, JS: 0=Sunday

    // Parse the scheduled time (in local time)
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    let scheduledDate = now.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });

    // Si es el mismo día y la hora no pasó, usar hoy
    if (targetDayIndex === currentDayIndex && scheduledDate > now) {
      return scheduledDate.toJSDate();
    }

    // Calcular el próximo día objetivo
    let daysUntilNext = targetDayIndex - currentDayIndex;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7;
    }
    const nextDate = now
      .plus({ days: daysUntilNext })
      .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    return nextDate.toJSDate();
  }

  /**
   * Get next occurrence for daily medications en la zona horaria del usuario
   */
  getNextDailyOccurrence(scheduledTime: string, timezone: string): Date {
    const now = DateTime.now().setZone(timezone);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    let scheduledDate = now.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });

    // Si la hora no pasó hoy, usar hoy
    if (scheduledDate > now) {
      return scheduledDate.toJSDate();
    }
    // Si ya pasó, usar mañana
    const tomorrow = now
      .plus({ days: 1 })
      .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    return tomorrow.toJSDate();
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
   * Convierte una hora local y fecha local (en zona horaria del usuario) a UTC
   */
  convertLocalTimeToUTC(
    localTime: string,
    timezone: string,
    localDate: Date,
  ): Date {
    const [hours, minutes] = localTime.split(':').map(Number);
    // Construir DateTime en la zona horaria del usuario, con la fecha y hora correctas
    const localDateTime = DateTime.fromJSDate(localDate, { zone: timezone })
      .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    return localDateTime.toUTC().toJSDate();
  }

  /**
   * Format date to UTC string
   */
  formatUTCDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
