import { Adherence } from '../entities/adherence.entity';

export class AdherencePresenter {
  static toHttp(adherence: Adherence) {
    return {
      id: adherence.id,
      user_id: adherence.user_id,
      medication_id: adherence.medication_id,
      scheduled_time: adherence.scheduled_time,
      scheduled_date: adherence.scheduled_date,
      taken_time: adherence.taken_time,
      status: adherence.status,
      notes: adherence.notes,
      reminder_sent: adherence.reminder_sent,
      side_effects_reported: adherence.side_effects_reported,
      dosage_taken: adherence.dosage_taken,
      created_at: adherence.created_at,
      updated_at: adherence.updated_at,
      medication: adherence.medication,
      user: adherence.user,
      reminders: adherence.reminders,
    };
  }

  static toHttpList(adherences: Adherence[]) {
    return adherences.map((adherence) => this.toHttp(adherence));
  }
}
