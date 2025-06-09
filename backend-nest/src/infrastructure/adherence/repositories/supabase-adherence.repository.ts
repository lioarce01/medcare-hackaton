import { Injectable } from '@nestjs/common';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import { Adherence } from '../../../domain/adherence/entities/adherence.entity';
import { AdherenceStatsRaw } from '../../../domain/adherence/entities/adherence-stats.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { AdherenceMapper } from '../../../domain/adherence/mappers/adherence.mapper';

@Injectable()
export class SupabaseAdherenceRepository implements AdherenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(adherence: Adherence): Promise<Adherence> {
    const data = {
      id: adherence.id,
      user_id: adherence.user_id,
      medication_id: adherence.medication_id,
      scheduled_time: adherence.scheduled_time,
      scheduled_date: adherence.scheduled_date,
      taken_time: adherence.taken_time,
      status: adherence.status,
      notes: adherence.notes,
      reminder_sent: adherence.reminder_sent,
      side_effects_reported: adherence.side_effects_reported,
      dosage_taken: adherence.dosage_taken,
      created_at: adherence.created_at,
      updated_at: adherence.updated_at,
    };

    const created = await this.prisma.adherence.create({
      data,
      include: {
        medication: true,
        user: true,
        reminders: true,
      },
    });

    return AdherenceMapper.toDomain(created);
  }

  async update(adherence: Adherence): Promise<Adherence> {
    const data = {
      user_id: adherence.user_id,
      medication_id: adherence.medication_id,
      scheduled_time: adherence.scheduled_time,
      scheduled_date: adherence.scheduled_date,
      taken_time: adherence.taken_time,
      status: adherence.status,
      notes: adherence.notes,
      reminder_sent: adherence.reminder_sent,
      side_effects_reported: adherence.side_effects_reported,
      dosage_taken: adherence.dosage_taken,
      updated_at: new Date(),
    };

    const updated = await this.prisma.adherence.update({
      where: { id: adherence.id },
      data,
      include: {
        medication: true,
        user: true,
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
        medication: true,
        user: true,
        reminders: true,
      },
    });

    return adherence ? AdherenceMapper.toDomain(adherence) : null;
  }

  async findByUser(userId: string): Promise<Adherence[]> {
    const adherences = await this.prisma.adherence.findMany({
      where: { user_id: userId },
      include: {
        medication: true,
        user: true,
        reminders: true,
      },
      orderBy: {
        scheduled_date: 'desc',
      },
    });

    return adherences.map(AdherenceMapper.toDomain);
  }

  async findActiveByUser(userId: string): Promise<Adherence[]> {
    const adherences = await this.prisma.adherence.findMany({
      where: {
        user_id: userId,
        status: 'pending',
      },
      include: {
        medication: true,
        user: true,
        reminders: true,
      },
      orderBy: {
        scheduled_date: 'asc',
      },
    });

    return adherences.map(AdherenceMapper.toDomain);
  }

  async getHistory(userId: string, date?: string): Promise<Adherence[]> {
    const whereClause: any = {
      user_id: userId,
    };

    if (date) {
      whereClause.scheduled_date = new Date(date);
    }

    const adherences = await this.prisma.adherence.findMany({
      where: whereClause,
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            dosage: true,
            instructions: true,
          },
        },
      },
      orderBy: {
        scheduled_time: 'asc',
      },
    });

    return adherences.map(AdherenceMapper.toDomain);
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
        medication: true,
        user: true,
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
        medication: true,
        user: true,
        reminders: true,
      },
    });

    return AdherenceMapper.toDomain(updated);
  }

  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AdherenceStatsRaw[]> {
    const whereClause: any = {
      user_id: userId,
    };

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

    const adherences = await this.prisma.adherence.findMany({
      where: whereClause,
      select: {
        status: true,
        medication: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return adherences.map((adherence: any) => ({
      status: adherence.status || 'pending',
      medication: {
        id: adherence.medication.id,
        name: adherence.medication.name,
      },
    }));
  }
}
