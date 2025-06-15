import { Injectable } from '@nestjs/common';
import { Adherence } from '../entities/adherence.entity';
import { Medication } from '../../medication/entities/medication.entity';
import { DateCalculationService } from './date-calculation.service';
import { v4 as uuidv4 } from 'uuid';

export interface AdherenceGenerationData {
  id?: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string; // Hora UTC en formato HH:mm
  scheduled_date: Date; // Fecha y hora UTC completa
  user_timezone?: string;
  status: string;
}

@Injectable()
export class AdherenceGenerationService {
  constructor(
    private readonly dateCalculationService: DateCalculationService,
  ) {}

  generateAdherenceRecords(
    medication: Medication,
    userTimezone: string = 'UTC',
  ): Adherence[] {
    const adherenceRecords: Adherence[] = [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aseguramos horario 24h para todos los scheduled_times
    const localScheduledTimes = medication.scheduled_times.map((time) =>
      this.dateCalculationService.ensure24HourFormat(time),
    );

    const pushAdherence = (localTime: string, scheduledDateLocal: Date) => {
      const utcDateTime: Date =
        this.dateCalculationService.convertLocalTimeToUTC(
          localTime,
          userTimezone,
          scheduledDateLocal,
        );

      // Extraemos hora en formato HH:mm desde Date UTC
      const utcTimeStr = new Date(utcDateTime).toISOString().slice(11, 16); // HH:mm

      adherenceRecords.push(
        this.createAdherenceEntity({
          user_id: medication.user_id,
          medication_id: medication.id,
          scheduled_time: utcTimeStr,
          scheduled_date: utcDateTime,
          user_timezone: userTimezone,
          status: 'pending',
        }),
      );
    };

    if (
      medication.frequency.specific_days &&
      medication.frequency.specific_days.length > 0
    ) {
      for (const day of medication.frequency.specific_days) {
        for (const localTime of localScheduledTimes) {
          const nextDate = this.dateCalculationService.getNextOccurrence(
            day,
            localTime,
          );

          pushAdherence(localTime, nextDate);

          // Verificar si la dosis de hoy no está creada y es válida
          const todayOccurrence = new Date(today);
          const [hours, minutes] = localTime.split(':').map(Number);
          todayOccurrence.setHours(hours, minutes, 0, 0);

          if (
            nextDate.toDateString() !== today.toDateString() && // nextDate no es hoy
            todayOccurrence > now && // la hora hoy no pasó aún
            todayOccurrence.getDay() === today.getDay() // es el mismo día de la semana
          ) {
            pushAdherence(localTime, today);
          }
        }
      }
    } else {
      for (const localTime of localScheduledTimes) {
        const nextDate =
          this.dateCalculationService.getNextDailyOccurrence(localTime);

        pushAdherence(localTime, nextDate);
      }
    }

    return adherenceRecords;
  }

  private createAdherenceEntity(data: AdherenceGenerationData): Adherence {
    const id = data.id || uuidv4();

    return new Adherence(
      id,
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
