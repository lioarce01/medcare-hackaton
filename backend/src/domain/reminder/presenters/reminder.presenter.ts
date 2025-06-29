import { Reminder } from '../entities/reminder.entity';
import { MedicationPresenter } from 'src/domain/medication/presenters/medication.presenter';

export class ReminderPresenter {
  static toHttp(reminder: Reminder) {
    return {
      id: reminder.id,
      user_id: reminder.user_id,
      medication_id: reminder.medication_id,
      scheduled_datetime: reminder.scheduled_datetime.toISOString(),
      status: reminder.status,
      channels: reminder.channels,
      message: reminder.message,
      retry_count: reminder.retry_count,
      last_retry: reminder.last_retry?.toISOString() || null,
      adherence_id: reminder.adherence_id,
      created_at: reminder.created_at?.toISOString() || null,
      updated_at: reminder.updated_at?.toISOString() || null,
      medication: reminder.medication ? MedicationPresenter.toHttp(reminder.medication) : null,
      is_overdue: reminder.isOverdue(),
    };
  }

  static toHttpList(reminders: Reminder[]) {
    return reminders.map(reminder => this.toHttp(reminder));
  }

  static toHttpSummary(reminder: Reminder) {
    return {
      id: reminder.id,
      medication_name: reminder.medication?.name || 'Unknown',
      scheduled_datetime: reminder.scheduled_datetime.toISOString(),
      status: reminder.status,
      is_overdue: reminder.isOverdue(),
    };
  }

  static toHttpSummaryList(reminders: Reminder[]) {
    return reminders.map(reminder => this.toHttpSummary(reminder));
  }
}
