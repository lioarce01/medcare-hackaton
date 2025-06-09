import { Injectable } from '@nestjs/common';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { ReminderRepository } from 'src/domain/reminder/repositories/reminder.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateReminderDto } from '../dtos/create-reminder.dto';
import { UpdateReminderDto } from '../dtos/update-reminder.dto';
import { ReminderMapper } from 'src/domain/reminder/mappers/reminder.mapper';

@Injectable()
export class SupabaseReminderRepository implements ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reminder: CreateReminderDto): Promise<Reminder> {
    const created = await this.prisma.reminders.create({
      data: {
        user_id: reminder.user_id,
        medication_id: reminder.medication_id,
        scheduled_time: reminder.scheduled_time,
        scheduled_date: new Date(reminder.scheduled_date),
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

    if (reminder.scheduled_time !== undefined)
      updateData.scheduled_time = reminder.scheduled_time;
    if (reminder.scheduled_date !== undefined)
      updateData.scheduled_date = new Date(reminder.scheduled_date);
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
    startDate?: string,
    endDate?: string,
  ): Promise<Reminder[]> {
    const whereClause: any = { user_id: userId };

    if (startDate) {
      whereClause.scheduled_date = {
        ...whereClause.scheduled_date,
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      whereClause.scheduled_date = {
        ...whereClause.scheduled_date,
        lte: new Date(endDate),
      };
    }

    const found = await this.prisma.reminders.findMany({
      where: whereClause,
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_date: 'asc' }, { scheduled_time: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findUpcomingByUser(
    userId: string,
    limit: number = 10,
  ): Promise<Reminder[]> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const found = await this.prisma.reminders.findMany({
      where: {
        user_id: userId,
        status: 'pending',
        OR: [
          { scheduled_date: { gt: new Date(today) } },
          {
            scheduled_date: new Date(today),
            scheduled_time: { gte: currentTime },
          },
        ],
      },
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_date: 'asc' }, { scheduled_time: 'asc' }],
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
      whereClause.scheduled_date = new Date(date);
    }

    if (startTime && endTime) {
      whereClause.scheduled_time = {
        gte: startTime,
        lte: endTime,
      };
    }

    const found = await this.prisma.reminders.findMany({
      where: whereClause,
      include: {
        medication: true,
        user: true,
      },
      orderBy: [{ scheduled_date: 'asc' }, { scheduled_time: 'asc' }],
    });
    return ReminderMapper.toDomainList(found);
  }

  async findOverdueReminders(userId?: string): Promise<Reminder[]> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const whereClause: any = {
      status: 'pending',
      OR: [
        { scheduled_date: { lt: new Date(today) } },
        {
          scheduled_date: new Date(today),
          scheduled_time: { lt: currentTime },
        },
      ],
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
      orderBy: [{ scheduled_date: 'desc' }, { scheduled_time: 'desc' }],
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
      orderBy: [{ scheduled_date: 'asc' }, { scheduled_time: 'asc' }],
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
        scheduled_time: reminder.scheduled_time,
        scheduled_date: new Date(reminder.scheduled_date),
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
      whereClause.scheduled_date = { gte: fromDate };
    }

    const result = await this.prisma.reminders.deleteMany({
      where: whereClause,
    });

    return { count: result.count };
  }
}
