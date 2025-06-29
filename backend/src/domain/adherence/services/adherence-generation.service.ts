import { Injectable } from '@nestjs/common';
import { Adherence } from '../entities/adherence.entity';
import { Medication } from '../../medication/entities/medication.entity';
import { DateCalculationService } from './date-calculation.service';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

@Injectable()
export class AdherenceGenerationService {
  constructor(
    private readonly dateCalculationService: DateCalculationService,
  ) { }

  generateAdherenceRecords(
    medication: Medication,
    userTimezone: string = 'UTC',
  ): Adherence[] {
    const adherenceRecords: Adherence[] = [];

    const startDateStr = typeof medication.start_date === 'string' ? medication.start_date : (medication.start_date instanceof Date ? medication.start_date.toISOString() : undefined);
    const endDateStr = typeof medication.end_date === 'string' ? medication.end_date : (medication.end_date instanceof Date ? medication.end_date.toISOString() : undefined);
    if (!startDateStr) {
      throw new Error('start_date is required and must be a valid date string or Date object');
    }
    const userTz = medication.userTimezone || userTimezone || 'UTC';
    const localStart = DateTime.fromISO(startDateStr, { zone: userTz }).startOf('day');
    const localEnd = endDateStr ? DateTime.fromISO(endDateStr, { zone: userTz }).startOf('day') : localStart;

    const localScheduledTimes = medication.scheduled_times.map((time) =>
      this.dateCalculationService.ensure24HourFormat(time),
    );

    // LOGS PARA DEPURACIÓN DE FECHA/HORA
    console.log('--- GENERACIÓN DE ADHERENCIA ---');
    console.log('startDateStr:', startDateStr);
    console.log('endDateStr:', endDateStr);
    console.log('userTimezone:', userTz);
    console.log('localScheduledTimes:', localScheduledTimes);

    let currentDay = localStart;
    const nowLocal = DateTime.now().setZone(userTz);
    while (currentDay <= localEnd) {
      // Si el día es en el pasado, saltar
      if (currentDay < nowLocal.startOf('day')) {
        currentDay = currentDay.plus({ days: 1 });
        continue;
      }
      for (const localTime of localScheduledTimes) {
        const [h, m] = localTime.split(':').map(Number);
        const localDateTime = currentDay.set({ hour: h, minute: m, second: 0, millisecond: 0 });
        // Si es el primer día, solo generar adherencias para horas >= ahora
        if (currentDay.hasSame(nowLocal, 'day') && localDateTime < nowLocal) {
          continue;
        }
        const utcDateTime = localDateTime.toUTC();
        adherenceRecords.push(
          this.createAdherenceEntity({
            user_id: medication.user_id,
            medication_id: medication.id,
            scheduled_datetime: utcDateTime.toJSDate(),
            user_timezone: userTz,
            status: 'pending',
          })
        );
      }
      currentDay = currentDay.plus({ days: 1 });
    }
    return adherenceRecords;
  }

  private createAdherenceEntity(data: any): Adherence {
    const id = data.id || uuidv4();

    return new Adherence(
      id,
      data.user_id,
      data.medication_id,
      data.scheduled_datetime,
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
