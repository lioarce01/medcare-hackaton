import { Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateMedicationDto } from '../../../interfaces/medication/dtos/create-medication.dto';
import { UpdateMedicationDto } from '../../../interfaces/medication/dtos/update-medication.dto';
import { MedicationMapper } from 'src/domain/medication/mappers/medication.mapper';

@Injectable()
export class SupabaseMedicationRepository implements MedicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(medication: CreateMedicationDto): Promise<Medication> {
    const refillReminderDefault = {
      enabled: false,
      threshold: 7,
      last_refill: null,
      next_refill: null,
      supply_amount: 0,
      supply_unit: '',
    };

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
        user: {
          connect: { id: medication.user_id },
        },
      },
    });

    return MedicationMapper.toDomain(created);
  }

  async update(medication: UpdateMedicationDto): Promise<Medication> {
    const updateData: any = { ...medication };
    if (updateData.dosage) updateData.dosage = updateData.dosage as any;
    if (updateData.frequency)
      updateData.frequency = updateData.frequency as any;
    if (updateData.refill_reminder)
      updateData.refill_reminder = updateData.refill_reminder as any;

    const updated = await this.prisma.medications.update({
      where: { id: medication.id },
      data: {
        ...updateData,
        start_date: updateData.start_date
          ? new Date(updateData.start_date)
          : undefined,
        end_date: updateData.end_date
          ? new Date(updateData.end_date)
          : undefined,
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
    });
    if (!found) return null;
    return MedicationMapper.toDomain(found);
  }

  async findByUser(userId: string): Promise<Medication[]> {
    const found = await this.prisma.medications.findMany({
      where: { user_id: userId },
    });
    return found.map((med: any) => MedicationMapper.toDomain(med));
  }

  async findActiveByUser(userId: string): Promise<Medication[]> {
    const found = await this.prisma.medications.findMany({
      where: { user_id: userId, active: true },
    });
    return found.map((med: any) => MedicationMapper.toDomain(med));
  }

  async findActiveDailyMedications(): Promise<Medication[]> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      m.*, 
      us.timezone AS user_timezone
    FROM "Medication" m
    JOIN "UserSettings" us ON m.user_id = us.user_id
    WHERE m.active = true
    AND (
      m.frequency->'specific_days' IS NULL
      OR jsonb_array_length(m.frequency->'specific_days') = 0
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
}
