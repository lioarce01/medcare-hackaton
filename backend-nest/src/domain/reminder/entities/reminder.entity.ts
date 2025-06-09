import { Medication } from 'src/domain/medication/entities/medication.entity';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';

export interface ReminderChannels {
  email: {
    enabled: boolean;
    sent: boolean;
    sentAt?: string;
  };
  sms: {
    enabled: boolean;
    sent: boolean;
    sentAt?: string;
  };
}

export class Reminder {
  constructor(
    public readonly id: string,
    public user_id: string,
    public medication_id: string,
    public scheduled_time: string,
    public scheduled_date: Date,
    public status: 'pending' | 'sent' | 'failed' = 'pending',
    public channels: ReminderChannels = {
      email: { enabled: true, sent: false },
      sms: { enabled: false, sent: false }
    },
    public message?: string | null,
    public retry_count: number = 0,
    public last_retry?: Date | null,
    public adherence_id?: string | null,
    public created_at?: Date | null,
    public updated_at?: Date | null,
    public medication?: Medication,
    public user?: UserAggregate,
  ) {}

  public isOverdue(): boolean {
    const now = new Date();
    const scheduledDateTime = new Date(`${this.scheduled_date.toISOString().split('T')[0]}T${this.scheduled_time}`);
    return now > scheduledDateTime && this.status === 'pending';
  }

  public canRetry(): boolean {
    return this.retry_count < 3 && this.status === 'failed';
  }

  public markAsSent(channel: 'email' | 'sms'): void {
    this.status = 'sent';
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date().toISOString();
    this.last_retry = new Date();
  }

  public markAsFailed(): void {
    this.status = 'failed';
    this.retry_count += 1;
    this.last_retry = new Date();
  }

  public isScheduledForToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const scheduledDate = this.scheduled_date.toISOString().split('T')[0];
    return today === scheduledDate;
  }

  public getScheduledDateTime(): Date {
    return new Date(`${this.scheduled_date.toISOString().split('T')[0]}T${this.scheduled_time}`);
  }
}
