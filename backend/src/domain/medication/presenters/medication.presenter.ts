import { Medication } from '../entities/medication.entity';

export class MedicationPresenter {
  static toHttp(medication: Medication) {
    return {
      id: medication.id,
      user_id: medication.user_id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      scheduled_times: medication.scheduled_times,
      instructions: medication.instructions,
      start_date: medication.start_date,
      end_date: medication.end_date,
      refill_reminder: medication.refill_reminder,
      side_effects_to_watch: medication.side_effects_to_watch,
      active: medication.active,
      medication_type: medication.medication_type,
      image_url: medication.image_url,
      created_at: medication.created_at,
      updated_at: medication.updated_at,
      adherence: medication.adherence,
      reminders: medication.reminders,
      user: medication.user,
    };
  }

  static toHttpList(medications: Medication[]) {
    return medications.map((medication) => this.toHttp(medication));
  }
}
