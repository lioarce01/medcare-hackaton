import { Adherence } from '../entities/adherence.entity';

export class AdherenceMapper {
  static toDomain(prismaAdherence: any): Adherence {
    return new Adherence(
      prismaAdherence.id,
      prismaAdherence.user_id,
      prismaAdherence.medication_id,
      prismaAdherence.scheduled_time,
      prismaAdherence.scheduled_date,
      prismaAdherence.taken_time,
      prismaAdherence.status,
      prismaAdherence.notes,
      prismaAdherence.reminder_sent,
      prismaAdherence.side_effects_reported || [],
      prismaAdherence.dosage_taken,
      prismaAdherence.created_at,
      prismaAdherence.updated_at,
      prismaAdherence.medication,
      prismaAdherence.user,
      prismaAdherence.reminders,
    );
  }

  static toPrisma(adherence: Adherence): any {
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
    };
  }
}
