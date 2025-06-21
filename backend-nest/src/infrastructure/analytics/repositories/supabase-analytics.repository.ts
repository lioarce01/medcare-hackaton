import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RiskHistoryRepository } from '../../../domain/analytics/repositories/risk-history.repository';
import { RiskHistory } from 'src/domain/analytics/entities/risk-history.entity';
import { AnalyticsMapper } from 'src/domain/analytics/mappers/analitycs.mapper';

@Injectable()
export class SupabaseAnalyticsRepository implements RiskHistoryRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(record: RiskHistory): Promise<void> {
    try {
      await this.prisma.risk_history.create({
        data: {
          user_id: record.user_id,
          medication_id: record.medication_id,
          date: new Date(record.date),
          risk_score: record.risk_score
        }
      })
    } catch (err) {
      console.error('Error creating risk history record:', err);
      throw new Error('Failed to create risk history record');
    }
  }

  async findByUserMedication(
    userId: string,
    medicationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RiskHistory[]> {
    try {
      console.log('findByUserMedication', { userId, medicationId, startDate, endDate });
      const where: any = {
        user_id: userId,
        medication_id: medicationId
      }
      if (startDate) {
        where.date = { gte: new Date(startDate) };
      }
      if (endDate) {
        where.date = { ...where.date, lte: new Date(endDate) };
      }
      const records = await this.prisma.risk_history.findMany({ where })
      console.log('findByUserMedication records:', records);
      return records.map(AnalyticsMapper.toDomain);
    } catch (err) {
      console.error('Error finding risk history by user and medication:', err);
      return [];
    }
  }

  async findByUser(userId: string, startDate?: string, endDate?: string): Promise<RiskHistory[]> {
    try {
      console.log('findByUser', { userId, startDate, endDate });
      const where: any = {
        user_id: userId
      };
      if (startDate) {
        where.date = { gte: new Date(startDate) };
      }
      if (endDate) {
        where.date = { ...where.date, lte: new Date(endDate) };
      }
      const records = await this.prisma.risk_history.findMany({ where });
      console.log('findByUser records:', records);
      return records.map(AnalyticsMapper.toDomain);
    } catch (err) {
      console.error('Error finding risk history by user:', err);
      return [];
    }
  }

  async getLatestRiskScore(userId: string, medicationId: string): Promise<number | null> {
    try {
      const records = await this.findByUserMedication(userId, medicationId);

      if (records.length === 0) {
        return null;
      }

      // Sort by date descending and get the latest
      const latest = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (!latest || !latest.risk_score) {
        return null;
      }

      return latest.risk_score;
    } catch (error) {
      console.error('Error getting latest risk score:', error);
      return null;
    }
  }
}
