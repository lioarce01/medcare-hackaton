import { Reminder, ReminderChannels } from '../entities/reminder.entity';
import { MedicationMapper } from 'src/domain/medication/mappers/medication.mapper';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';

export class ReminderMapper {
  static toDomain(prismaReminder: any): Reminder {
    return new Reminder(
      prismaReminder.id,
      prismaReminder.user_id,
      prismaReminder.medication_id,
      prismaReminder.scheduled_time,
      new Date(prismaReminder.scheduled_date),
      prismaReminder.status,
      prismaReminder.channels as ReminderChannels,
      prismaReminder.message,
      prismaReminder.retry_count,
      prismaReminder.last_retry ? new Date(prismaReminder.last_retry) : null,
      prismaReminder.adherence_id,
      prismaReminder.created_at ? new Date(prismaReminder.created_at) : null,
      prismaReminder.updated_at ? new Date(prismaReminder.updated_at) : null,
      prismaReminder.medication
        ? MedicationMapper.toDomain(prismaReminder.medication)
        : undefined,
      prismaReminder.user
        ? UserMapper.toDomain(
            prismaReminder.user,
            prismaReminder.user.auth_user_id || prismaReminder.user.id,
          )
        : undefined,
    );
  }

  static toDomainList(prismaReminders: any[]): Reminder[] {
    return prismaReminders.map((reminder) => this.toDomain(reminder));
  }
}
