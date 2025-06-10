import { UpdateReminderDto } from 'src/interfaces/reminder/dtos/update-reminder.dto';
import { Reminder } from '../entities/reminder.entity';
import { CreateReminderDto } from 'src/interfaces/reminder/dtos/create-reminder.dto';

export interface ReminderRepository {
  create(reminder: CreateReminderDto): Promise<Reminder>;
  update(reminder: UpdateReminderDto): Promise<Reminder>;
  delete(id: string): Promise<{ message: string }>;
  findById(id: string): Promise<Reminder | null>;
  findByUser(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Reminder[]>;
  findUpcomingByUser(userId: string, limit?: number): Promise<Reminder[]>;
  findPendingReminders(
    userId?: string,
    date?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<Reminder[]>;
  findOverdueReminders(userId?: string): Promise<Reminder[]>;
  findByMedication(medicationId: string): Promise<Reminder[]>;
  findByAdherence(adherenceId: string): Promise<Reminder | null>;
  markAsSent(id: string, channel: 'email' | 'sms'): Promise<Reminder>;
  markAsFailed(id: string): Promise<Reminder>;
  bulkCreate(reminders: CreateReminderDto[]): Promise<Reminder[]>;
  deleteByMedication(
    medicationId: string,
    fromDate?: Date,
  ): Promise<{ count: number }>;
}
