import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';

export class Medication {
  constructor(
    public readonly id: string,
    public user_id: string,
    public name: string,
    public dosage: {
      amount: number;
      unit: string;
    },
    public frequency: {
      times_per_day: number;
      specific_days: string[];
    },
    public scheduled_times: string[],
    public userTimezone: string,
    public instructions?: string | null,
    public start_date?: Date | null,
    public end_date?: Date | null,
    public refill_reminder?: {
      enabled: boolean;
      threshold: number;
      last_refill?: Date | null;
      next_refill?: Date | null;
      supply_amount: number;
      supply_unit: string;
    } | null,
    public side_effects_to_watch: string[] = [],
    public active: boolean = true,
    public medication_type?: string | null,
    public image_url?: string | null,
    public created_at?: Date | null,
    public updated_at?: Date | null,
    public adherence?: any[],
    public reminders?: any[],
    public user?: any,
  ) {}

  toDTO() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      dosage: this.dosage,
      frequency: this.frequency,
      scheduled_times: this.scheduled_times,
      userTimezone: this.userTimezone,
      instructions: this.instructions,
      start_date: this.start_date?.toISOString() ?? null,
      end_date: this.end_date?.toISOString() ?? null,
      refill_reminder: this.refill_reminder
        ? {
            enabled: this.refill_reminder.enabled,
            threshold: this.refill_reminder.threshold,
            last_refill:
              this.refill_reminder.last_refill?.toISOString() ?? null,
            next_refill:
              this.refill_reminder.next_refill?.toISOString() ?? null,
            supply_amount: this.refill_reminder.supply_amount,
            supply_unit: this.refill_reminder.supply_unit,
          }
        : null,
      side_effects_to_watch: this.side_effects_to_watch,
      active: this.active,
      medication_type: this.medication_type,
      image_url: this.image_url,
      created_at: this.created_at?.toISOString() ?? null,
      updated_at: this.updated_at?.toISOString() ?? null,
      adherence: this.adherence,
      reminders: this.reminders,
    };
  }
}
