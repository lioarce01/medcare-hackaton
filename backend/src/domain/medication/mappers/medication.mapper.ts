import { Medication } from '../entities/medication.entity';

export class MedicationMapper {
  static toDomain(prismaMedication: any): Medication {
    // Asegurar que refill_reminder es un objeto o null
    let refillReminder = null;
    if (
      prismaMedication.refill_reminder &&
      typeof prismaMedication.refill_reminder === 'object' &&
      !Array.isArray(prismaMedication.refill_reminder)
    ) {
      refillReminder = prismaMedication.refill_reminder;
    }

    // Asegurar que side_effects_to_watch es un array
    const sideEffects = Array.isArray(prismaMedication.side_effects_to_watch)
      ? prismaMedication.side_effects_to_watch
      : [];

    // Convertir fechas Date a ISO string
    const startDate =
      prismaMedication.start_date instanceof Date
        ? prismaMedication.start_date.toISOString()
        : prismaMedication.start_date;

    const endDate =
      prismaMedication.end_date instanceof Date
        ? prismaMedication.end_date.toISOString()
        : prismaMedication.end_date;

    const createdAt =
      prismaMedication.created_at instanceof Date
        ? prismaMedication.created_at.toISOString()
        : prismaMedication.created_at;

    const updatedAt =
      prismaMedication.updated_at instanceof Date
        ? prismaMedication.updated_at.toISOString()
        : prismaMedication.updated_at;

    const medication = new Medication(
      prismaMedication.id,
      prismaMedication.user_id,
      prismaMedication.name,
      prismaMedication.dosage,
      prismaMedication.frequency,
      prismaMedication.scheduled_times,
      'UTC', // Default timezone, will be set below
      prismaMedication.instructions,
      prismaMedication.start_date,
      prismaMedication.end_date,
      prismaMedication.refill_reminder,
      prismaMedication.side_effects_to_watch,
      prismaMedication.active,
      prismaMedication.medication_type,
      prismaMedication.image_url,
      prismaMedication.created_at,
      prismaMedication.updated_at,
      prismaMedication.adherence,
      prismaMedication.reminders,
      prismaMedication.user,
    );

    // Set timezone safely - check multiple sources
    let timezone = 'UTC';

    // First check if user_timezone was passed directly (for new medications)
    if (prismaMedication.user_timezone) {
      timezone = prismaMedication.user_timezone;
    }
    // Then check user settings
    else if (prismaMedication.user?.settings?.timezone) {
      timezone = prismaMedication.user.settings.timezone;
    }

    medication.userTimezone = timezone;

    return medication;
  }
}
