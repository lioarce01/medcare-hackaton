import { Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateMedicationDto } from '../../../interfaces/medication/dtos/create-medication.dto';
import { UpdateMedicationDto } from '../../../interfaces/medication/dtos/update-medication.dto';
import { MedicationMapper } from 'src/domain/medication/mappers/medication.mapper';

@Injectable()
export class SupabaseMedicationRepository implements MedicationRepository {
  constructor(private readonly prisma: PrismaService) { }

  async update(userId: string, id: string, medication: UpdateMedicationDto): Promise<Medication> {
    const updateData: any = { ...medication };
    if (updateData.dosage) updateData.dosage = updateData.dosage as any;
    if (updateData.frequency)
      updateData.frequency = updateData.frequency as any;
    if (updateData.refill_reminder)
      updateData.refill_reminder = updateData.refill_reminder as any;

    const updated = await this.prisma.medications.update({
      where: { id, user_id: userId },
      data: {
        ...updateData,
        start_date: updateData.start_date
          ? new Date(updateData.start_date)
          : undefined,
        end_date: updateData.end_date
          ? new Date(updateData.end_date)
          : undefined,
      },
      include: {
        users: {
          include: {
            user_settings: true,
          },
        },
      },
    });
    return MedicationMapper.toDomain(updated);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.prisma.medications.delete({
      where: { id },
    });
    return { message: 'Medication deleted successfully' };
  }

  async findById(id: string): Promise<Medication | null> {
    const found = await this.prisma.medications.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user_settings: true,
          },
        },
      },
    });
    if (!found) return null;
    return MedicationMapper.toDomain(found);
  }

  async findByUser(userId: string, page = 1, limit = 10, searchTerm?: string, filterType?: string): Promise<{
    data: Medication[],
    page: number,
    limit: number,
    total: number
  }> {
    const skip = (page - 1) * limit
    const where: any = {
      user_id: userId
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { instructions: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    if (filterType && filterType !== 'all') {
      where.medication_type = filterType;
    }

    const [found, total] = await Promise.all([
      this.prisma.medications.findMany({
        where, // Use the combined where clause
        skip,
        take: limit,
        include: {
          users: {
            include: {
              user_settings: true,
            },
          },
        },
      }),
      this.prisma.medications.count({
        where // Use the same where clause for count
      })
    ])
    return {
      data: found.map((med: any) => MedicationMapper.toDomain(med)),
      page,
      limit,
      total
    }
  }

  async findActiveByUser(userId: string, page = 1, limit = 10): Promise<{
    data: Medication[],
    page: number,
    limit: number,
    total: number
  }> {
    const skip = (page - 1) * limit
    const whereClause = {
      user_id: userId,
      active: true,
    }
    const [found, total] = await Promise.all([
      this.prisma.medications.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          users: {
            include: {
              user_settings: true,
            },
          },
        },
      }),
      this.prisma.medications.count({ where: whereClause })
    ])
    return {
      data: found.map((med: any) => MedicationMapper.toDomain(med)),
      page,
      limit,
      total
    }
  }

  async findActiveDailyMedications(): Promise<Medication[]> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      m.*, 
      us.timezone AS user_timezone
    FROM medications m
    LEFT JOIN "user_settings" us ON m.user_id = us.user_id
    WHERE m.active = true
    AND (
      m.frequency->>'specific_days' IS NULL
      OR m.frequency->>'specific_days' = '[]'
      OR m.frequency->>'specific_days' = ''
    )
  `);

    return result.map((med) =>
      MedicationMapper.toDomain({
        ...med,
        frequency:
          typeof med.frequency === 'string'
            ? JSON.parse(med.frequency)
            : med.frequency,
        userTimezone: med.user_timezone || 'UTC',
      }),
    );
  }

  async findByUserNameAndStartDate(userId: string, name: string, startDate: Date): Promise<Medication | null> {
    const found = await this.prisma.medications.findFirst({
      where: {
        user_id: userId,
        name,
        start_date: startDate,
      },
      include: {
        users: {
          include: {
            user_settings: true,
          },
        },
      },
    });
    if (!found) return null;
    return MedicationMapper.toDomain(found);
  }

  async create(medication: CreateMedicationDto): Promise<Medication> {
    const rr = medication.refill_reminder;
    const refillReminder = rr
      ? {
        enabled: rr.enabled ?? false,
        threshold: rr.threshold ?? rr.days_before ?? 7,
        last_refill: rr.last_refill ?? null,
        next_refill: rr.next_refill ?? null,
        supply_amount: rr.supply_amount ?? 0,
        supply_unit: rr.supply_unit ?? '',
      }
      : null;

    const created = await this.prisma.medications.create({
      data: {
        name: medication.name,
        dosage: medication.dosage as any,
        frequency: medication.frequency as any,
        scheduled_times: medication.scheduled_times,
        instructions: medication.instructions,
        start_date: medication.start_date
          ? new Date(medication.start_date)
          : undefined,
        end_date: medication.end_date
          ? new Date(medication.end_date)
          : undefined,
        refill_reminder: refillReminder as any,
        side_effects_to_watch: medication.side_effects_to_watch,
        active: medication.active,
        medication_type: medication.medication_type,
        image_url: medication.image_url,
        users: {
          connect: { id: medication.user_id },
        },
      },
      include: {
        users: {
          include: {
            user_settings: true,
          },
        },
      },
    });
    // Pass the user_timezone from the DTO to the mapper
    const medicationWithTimezone = {
      ...created,
      user_timezone: medication.user_timezone
    };
    return MedicationMapper.toDomain(medicationWithTimezone);
  }
}
