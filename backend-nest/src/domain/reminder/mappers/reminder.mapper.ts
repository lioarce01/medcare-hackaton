import { Reminder, ReminderChannels } from '../entities/reminder.entity';
import { MedicationMapper } from 'src/domain/medication/mappers/medication.mapper';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';

export class ReminderMapper {
  static toDomain(prismaReminder: any): Reminder {
    // Debug logging
    console.log('ReminderMapper.toDomain called with:', {
      id: prismaReminder.id,
      userId: prismaReminder.user_id,
      hasUser: !!prismaReminder.users,
      hasMedication: !!prismaReminder.medications,
      userData: prismaReminder.users ? {
        id: prismaReminder.users.id,
        email: prismaReminder.users.email,
        name: prismaReminder.users.name
      } : null
    });

    const reminder = new Reminder(
      prismaReminder.id,
      prismaReminder.user_id,
      prismaReminder.medication_id,
      new Date(prismaReminder.scheduled_datetime), // single UTC datetime
      prismaReminder.status,
      prismaReminder.channels as ReminderChannels,
      prismaReminder.message,
      prismaReminder.retry_count,
      prismaReminder.last_retry ? new Date(prismaReminder.last_retry) : null,
      prismaReminder.adherence_id,
      prismaReminder.created_at ? new Date(prismaReminder.created_at) : null,
      prismaReminder.updated_at ? new Date(prismaReminder.updated_at) : null,
      prismaReminder.medications
        ? MedicationMapper.toDomain(prismaReminder.medications)
        : undefined,
      prismaReminder.users
        ? UserMapper.toDomain(
          prismaReminder.users,
          prismaReminder.users.id,
        )
        : undefined,
    );

    // Debug logging
    console.log('Reminder created:', {
      id: reminder.id,
      userId: reminder.user_id,
      hasUser: !!reminder.user,
      hasUserUser: !!reminder.user?.user,
      userEmail: reminder.user?.user?.email
    });

    return reminder;
  }

  static toDomainList(prismaReminders: any[]): Reminder[] {
    return prismaReminders.map((reminder) => this.toDomain(reminder));
  }
}
