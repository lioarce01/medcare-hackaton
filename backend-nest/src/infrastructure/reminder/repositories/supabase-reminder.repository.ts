import { Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateReminderDto } from '../../../interfaces/reminder/dtos/create-reminder.dto';
import { UpdateReminderDto } from '../../../interfaces/reminder/dtos/update-reminder.dto';
import { ReminderMapper } from 'src/domain/reminder/mappers/reminder.mapper';

@Injectable()
export class SupabaseReminderRepository implements ReminderRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(reminder: CreateReminderDto): Promise<Reminder> {
    const created = await this.prisma.reminders.create({
      data: {
        user_id: reminder.user_id,
        medication_id: reminder.medication_id,
        scheduled_datetime: new Date(reminder.scheduled_datetime),
        status: reminder.status || 'pending',
        channels: (reminder.channels || {
          email: { enabled: true, sent: false },
          sms: { enabled: false, sent: false },
        }) as any,
        message: reminder.message,
        retry_count: reminder.retry_count || 0,
        last_retry: reminder.last_retry ? new Date(reminder.last_retry) : null,
        adherence_id: reminder.adherence_id,
      },
      include: {
        medication: true,
        user: true,
      },
    });
    return ReminderMapper.toDomain(created);
  }

  async update(reminder: UpdateReminderDto): Promise<Reminder> {
    const updateData: any = {};

    if (reminder.scheduled_datetime !== undefined)
      updateData.scheduled_datetime = new Date(reminder.scheduled_datetime);
    if (reminder.status !== undefined) updateData.status = reminder.status;
    if (reminder.channels !== undefined)
      updateData.channels = reminder.channels;
    if (reminder.message !== undefined) updateData.message = reminder.message;
    if (reminder.retry_count !== undefined)
      updateData.retry_count = reminder.retry_count;
    if (reminder.last_retry !== undefined)
      updateData.last_retry = reminder.last_retry
        ? new Date(reminder.last_retry)
        : null;

    const updated = await this.prisma.reminders.update({
      where: { id: reminder.id },
      data: updateData,
      include: {
        medication: true,
        user: true,
      },
    });
    return ReminderMapper.toDomain(updated);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.prisma.reminders.delete({
      where: { id },
    });
    return { message: 'Reminder deleted successfully' };
  }

  async findById(id: string): Promise<Reminder | null> {
    const found = await this.prisma.reminders.findUnique({
      where: { id },
      include: {
        medication: true,
        user: true,
      },
    });
    if (!found) return null;
    return ReminderMapper.toDomain(found);
  }

  async findByUser(
    userId: string,
    startDatetime?: string,
    endDatetime?: string,
  ): Promise<Reminder[]> {
    const whereClause: any = { user_id: userId };

    if (startDatetime) {
      whereClause.scheduled_datetime = {
        ...whereClause.scheduled_datetime,
        gte: new Date(startDatetime),
      };
    }
    if (endDatetime) {
      whereClause.scheduled_datetime = {
        ...whereClause.scheduled_datetime,
        lte: new Date(endDatetime),
      };
    }

    const found = await this.prisma.reminders.findMany({
      where: whereClause,
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_datetime: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findUpcomingByUser(
    userId: string,
    limit: number = 10,
  ): Promise<Reminder[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const nowISO = now.toISOString();

    const found = await this.prisma.reminders.findMany({
      where: {
        user_id: userId,
        status: 'pending',
        scheduled_datetime: { gte: now },
      },
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_datetime: 'asc' }],
      take: limit,
    });
    return ReminderMapper.toDomainList(found);
  }

  async findPendingReminders(
    userId?: string,
    date?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<Reminder[]> {
    const whereClause: any = { status: 'pending' };

    if (userId) {
      whereClause.user_id = userId;
    }

    if (date) {
      // Filter reminders for a specific day (UTC)
      const dayStart = new Date(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCHours(23, 59, 59, 999);
      whereClause.scheduled_datetime = { gte: dayStart, lte: dayEnd };
    }

    if (startTime && endTime && date) {
      // Filter reminders between startTime and endTime on a specific date
      const day = new Date(date);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startDateTime = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), startHour, startMinute || 0));
      const endDateTime = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), endHour, endMinute || 0));
      whereClause.scheduled_datetime = { gte: startDateTime, lte: endDateTime };
    }

    const found = await this.prisma.reminders.findMany({
      where: whereClause,
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_datetime: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findOverdueReminders(userId?: string): Promise<Reminder[]> {
    const now = new Date();
    const whereClause: any = {
      status: 'pending',
      scheduled_datetime: { lt: now },
    };

    if (userId) {
      whereClause.user_id = userId;
    }

    const found = await this.prisma.reminders.findMany({
      where: whereClause,
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_datetime: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findByMedication(medicationId: string): Promise<Reminder[]> {
    const found = await this.prisma.reminders.findMany({
      where: { medication_id: medicationId },
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_datetime: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findByAdherence(adherenceId: string): Promise<Reminder | null> {
    const found = await this.prisma.reminders.findFirst({
      where: { adherence_id: adherenceId },
      include: {
        medication: true,
        user: true,
      },
    });
    if (!found) return null;
    return ReminderMapper.toDomain(found);
  }

  async markAsSent(id: string, channel: 'email' | 'sms'): Promise<Reminder> {
    const reminder = await this.findById(id);
    if (!reminder) throw new Error('Reminder not found');

    const updatedChannels = { ...reminder.channels };
    updatedChannels[channel].sent = true;
    updatedChannels[channel].sentAt = new Date().toISOString();

    return this.update({
      id,
      status: 'sent',
      channels: updatedChannels,
      last_retry: new Date().toISOString(),
    });
  }

  async markAsFailed(id: string): Promise<Reminder> {
    const reminder = await this.findById(id);
    if (!reminder) throw new Error('Reminder not found');

    return this.update({
      id,
      status: 'failed',
      retry_count: reminder.retry_count + 1,
      last_retry: new Date().toISOString(),
    });
  }

  async bulkCreate(reminders: CreateReminderDto[]): Promise<Reminder[]> {
    await this.prisma.reminders.createMany({
      data: reminders.map((reminder) => ({
        user_id: reminder.user_id,
        medication_id: reminder.medication_id,
        scheduled_datetime: new Date(reminder.scheduled_datetime),
        status: reminder.status || 'pending',
        channels: (reminder.channels || {
          email: { enabled: true, sent: false },
          sms: { enabled: false, sent: false },
        }) as any,
        message: reminder.message,
        retry_count: reminder.retry_count || 0,
        last_retry: reminder.last_retry ? new Date(reminder.last_retry) : null,
        adherence_id: reminder.adherence_id,
      })),
    });

    // Return the created reminders
    const createdReminders = await this.prisma.reminders.findMany({
      where: {
        user_id: { in: reminders.map((r) => r.user_id) },
        medication_id: { in: reminders.map((r) => r.medication_id) },
        created_at: { gte: new Date(Date.now() - 5000) }, // Last 5 seconds
      },
      include: {
        medication: true,
        user: true,
      },
    });

    return ReminderMapper.toDomainList(createdReminders);
  }

  async deleteByMedication(
    medicationId: string,
    fromDate?: Date,
  ): Promise<{ count: number }> {
    const whereClause: any = {
      medication_id: medicationId,
      status: 'pending',
    };

    if (fromDate) {
      whereClause.scheduled_datetime = { gte: fromDate };
    }

    const result = await this.prisma.reminders.deleteMany({
      where: whereClause,
    });

    return { count: result.count };
  }
}
