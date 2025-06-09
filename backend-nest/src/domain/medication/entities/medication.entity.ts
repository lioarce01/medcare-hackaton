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
    public user?: UserAggregate,
  ) {}
}
