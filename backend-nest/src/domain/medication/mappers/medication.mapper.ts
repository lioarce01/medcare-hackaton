import { Medication } from '../entities/medication.entity';

export class MedicationMapper {
  static toDomain(prismaMedication: any): Medication {
    return new Medication(
      prismaMedication.id,
      prismaMedication.user_id,
      prismaMedication.name,
      prismaMedication.dosage,
      prismaMedication.frequency,
      prismaMedication.scheduled_times,
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
  }
}
