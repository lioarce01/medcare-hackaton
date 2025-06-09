import { Medication } from 'src/domain/medication/entities/medication.entity';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';

export class Adherence {
  constructor(
    public readonly id: string,
    public user_id: string,
    public medication_id: string,
    public scheduled_time: string,
    public scheduled_date: Date,
    public taken_time?: Date | null,
    public status?: string | null,
    public notes?: string | null,
    public reminder_sent?: boolean | null,
    public side_effects_reported: string[] = [],
    public dosage_taken?: {
      amount: number;
      unit: string;
    } | null,
    public created_at?: Date | null,
    public updated_at?: Date | null,
    public medication?: Medication,
    public user?: UserAggregate,
    public reminders?: any[],
  ) {
    this.status = status ?? 'pending';
    this.reminder_sent = reminder_sent ?? false;
  }
}
