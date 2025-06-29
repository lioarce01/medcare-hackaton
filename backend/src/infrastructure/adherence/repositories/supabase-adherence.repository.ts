import { Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';
import { AdherenceStatsRaw } from '../../../domain/adherence/entities/adherence-stats.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { AdherenceMapper } from '../../../domain/adherence/mappers/adherence.mapper';
import { DateTime } from 'luxon';

@Injectable()
export class SupabaseAdherenceRepository implements AdherenceRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(adherence: Adherence): Promise<Adherence> {
    const data = {
      id: adherence.id,
      user_id: adherence.user_id,
      medication_id: adherence.medication_id,
      scheduled_datetime: adherence.scheduled_datetime,
      taken_time: adherence.taken_time,
      status: adherence.status,
      notes: adherence.notes,
      reminder_sent: adherence.reminder_sent,
      side_effects_reported: adherence.side_effects_reported,
      dosage_taken: adherence.dosage_taken as any,
      created_at: adherence.created_at,
      updated_at: adherence.updated_at,
    };

    const created = await this.prisma.adherence.create({
      data,
      include: {
        medications: true,
        users: true,
        reminders: true,
      },
    });

    const domainEntity = AdherenceMapper.toDomain(created);

    return domainEntity;
  }

  async update(adherence: Adherence): Promise<Adherence> {
    const data = {
      user_id: adherence.user_id,
      medication_id: adherence.medication_id,
      scheduled_datetime: adherence.scheduled_datetime,
      taken_time: adherence.taken_time,
      status: adherence.status,
      notes: adherence.notes,
      reminder_sent: adherence.reminder_sent,
      side_effects_reported: adherence.side_effects_reported,
      dosage_taken: adherence.dosage_taken as any,
      updated_at: new Date(),
    };

    const updated = await this.prisma.adherence.update({
      where: { id: adherence.id },
      data,
      include: {
        medications: true,
        users: true,
        reminders: true,
      },
    });

    return AdherenceMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.adherence.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Adherence | null> {
    const adherence = await this.prisma.adherence.findUnique({
      where: { id },
      include: {
        medications: true,
        users: true,
        reminders: true,
      },
    });

    return adherence ? AdherenceMapper.toDomain(adherence) : null;
  }

  async findByUser(userId: string, page = 1, limit = 10): Promise<{
    data: Adherence[],
    page: number,
    limit: number,
    total: number
  }> {
    const skip = (page - 1) * limit;
    const [adherences, total] = await Promise.all([
      await this.prisma.adherence.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        include: {
          medications: true,
          users: true,
          reminders: true,
        },
        orderBy: {
          scheduled_datetime: 'desc',
        },
      }),
      await this.prisma.adherence.count({ where: { user_id: userId } })
    ])

    return {
      data: adherences.map(AdherenceMapper.toDomain),
      page,
      limit,
      total,
    }
  }

  async findActiveByUser(userId: string, page = 1, limit = 10): Promise<{
    data: Adherence[],
    page: number,
    limit: number,
    total: number
  }> {
    const skip = (page - 1) * limit;
    const whereClause = {
      user_id: userId,
      status: 'pending',
    }

    const [adherences, total] = await Promise.all([
      await this.prisma.adherence.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          medications: true,
          users: true,
          reminders: true,
        },
        orderBy: {
          scheduled_datetime: 'asc',
        },
      }),
      await this.prisma.adherence.count({
        where: {
          user_id: userId,
          status: 'pending',
        },
      }),
    ])

    return {
      data: adherences.map(AdherenceMapper.toDomain),
      page,
      limit,
      total,
    }
  }

  async getHistory(userId: string, page = 1, limit = 10, date?: string): Promise<{
    data: Adherence[],
    page: number,
    limit: number,
    total: number
  }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {
      user_id: userId,
    };

    if (date) {
      // date is expected as YYYY-MM-DD
      const start = new Date(date + 'T00:00:00.000Z');
      const end = new Date(date + 'T23:59:59.999Z');
      whereClause.scheduled_datetime = {
        gte: start,
        lte: end,
      };
    }

    const [adherences, total] = await Promise.all([
      this.prisma.adherence.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          medications: {
            select: {
              id: true,
              name: true,
              dosage: true,
              instructions: true,
            },
          },
        },
        orderBy: { scheduled_datetime: 'asc' },
      }),
      this.prisma.adherence.count({ where: whereClause }),
    ]);

    return {
      data: adherences.map(AdherenceMapper.toDomain),
      page,
      limit,
      total,
    }
  }

  async confirmDose(adherenceId: string, userId: string): Promise<Adherence> {
    const updated = await this.prisma.adherence.update({
      where: {
        id: adherenceId,
        user_id: userId,
      },
      data: {
        status: 'taken',
        taken_time: new Date(),
        updated_at: new Date(),
      },
      include: {
        medications: true,
        users: true,
        reminders: true,
      },
    });

    return AdherenceMapper.toDomain(updated);
  }

  async skipDose(adherenceId: string, userId: string): Promise<Adherence> {
    const updated = await this.prisma.adherence.update({
      where: {
        id: adherenceId,
        user_id: userId,
      },
      data: {
        status: 'skipped',
        updated_at: new Date(),
      },
      include: {
        medications: true,
        users: true,
        reminders: true,
      },
    });

    return AdherenceMapper.toDomain(updated);
  }

  async getStats(
    userId: string,
    startDate: DateTime, // Ahora recibe DateTime
    endDate: DateTime, // Ahora recibe DateTime
    timezone: string, // Recibe timezone
  ): Promise<AdherenceStatsRaw[]> {
    const whereClause: any = {
      user_id: userId,
    };
    // Calculate a wider UTC range for DB query based on local range
    const startUtcQuery = startDate.startOf('day').toUTC().toJSDate();
    const endUtcQuery = endDate.endOf('day').toUTC().toJSDate();

    whereClause.scheduled_datetime = {
      gte: startUtcQuery,
      lte: endUtcQuery,
    };

    const adherences = await this.prisma.adherence.findMany({
      where: whereClause,
      select: {
        status: true,
        medications: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return adherences.map(adherence => ({
      status: adherence.status ?? '',
      medication: {
        id: adherence.medications.id,
        name: adherence.medications.name,
      },
    }))
  }

  // Methods for cron jobs
  async findPendingForMissedProcessing(
    todayStr: string,
    cutoffTime: Date,
  ): Promise<Adherence[]> {
    try {
      // Get pending records scheduled before the cutoff datetime and for today
      const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);
      const missed = await this.prisma.adherence.findMany({
        where: {
          status: 'pending',
          scheduled_datetime: {
            gte: startOfDay,
            lte: cutoffTime,
          },
        },
        include: {
          medications: true,
          users: true,
          reminders: true,
        },
      });
      return missed.map(AdherenceMapper.toDomain);
    } catch (error) {
      console.error(
        'Error finding pending adherence for missed processing:',
        error,
      );
      throw error;
    }
  }

  async findByUserMedicationDateRange(
    userId: string,
    medicationId: string,
    startDate: string,
    endDate: string,
  ): Promise<Adherence[]> {
    try {
      const adherences = await this.prisma.adherence.findMany({
        where: {
          user_id: userId,
          medication_id: medicationId,
          scheduled_datetime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          medications: true,
          users: true,
          reminders: true,
        },
        orderBy: {
          scheduled_datetime: 'asc',
        },
      });

      return adherences.map(AdherenceMapper.toDomain);
    } catch (error) {
      console.error(
        'Error finding adherence by user medication date range:',
        error,
      );
      throw error;
    }
  }

  async updateStatus(adherenceId: string, status: string): Promise<void> {
    try {
      await this.prisma.adherence.update({
        where: { id: adherenceId },
        data: {
          status,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating adherence status:', error);
      throw error;
    }
  }

  async exists(
    userId: string,
    medicationId: string,
    scheduledDatetime: Date,
  ): Promise<boolean> {
    try {
      const adherence = await this.prisma.adherence.findFirst({
        where: {
          user_id: userId,
          medication_id: medicationId,
          scheduled_datetime: scheduledDatetime,
        },
      });

      return !!adherence;
    } catch (error) {
      console.error('Error checking adherence existence:', error);
      throw error;
    }
  }

  async getTimeline(userId: string, startDate: string, endDate: string, page = 1, limit = 10): Promise<{
    data: Adherence[],
    page: number,
    limit: number,
    total: number
  }> {
    // Defensive: Only create Date if string is valid
    const start = Date.parse(startDate) ? new Date(startDate) : null;
    const end = Date.parse(endDate) ? new Date(endDate) : null;
    const skip = (page - 1) * limit;

    if (!start || !end) {
      throw new Error('Invalid startDate or endDate for adherence timeline');
    }
    const whereClause: any = {
      user_id: userId,
      scheduled_datetime: {
        gte: start,
        lte: end,
      },
    };

    const [adherences, total] = await Promise.all([
      this.prisma.adherence.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          medications: {
            select: {
              id: true,
              name: true,
              dosage: true,
              instructions: true,
            },
          },
        },
        orderBy: {
          scheduled_datetime: 'asc',
        },
      }),
      this.prisma.adherence.count({
        where: whereClause
      })
    ])

    return {
      data: adherences.map(AdherenceMapper.toDomain),
      page,
      limit,
      total
    }
  }
}
