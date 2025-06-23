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
    endDate?: string,
    page = 1,
    limit = 10
  ): Promise<{
    data: RiskHistory[],
    page: number,
    limit: number,
    total: number
  }> {
    const whereClause: any = {
      user_id: userId,
      medication_id: medicationId
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      this.prisma.risk_history.findMany({
        where: whereClause,
        skip,
        take: limit
      }),
      this.prisma.risk_history.count({
        where: whereClause
      })
    ])

    return {
      data: records.map(AnalyticsMapper.toDomain),
      page,
      limit,
      total
    }
  }

  async findByUser(userId: string, startDate?: string, endDate?: string, page = 1, limit = 10): Promise<{
    data: RiskHistory[],
    page: number,
    limit: number,
    total: number
  }> {
    const whereClause: any = {
      user_id: userId
    };
    if (startDate) {
      whereClause.date = { gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit
    const [records, total] = await Promise.all([
      this.prisma.risk_history.findMany({
        where: whereClause,
        skip,
        take: limit
      }),
      this.prisma.risk_history.count({
        where: whereClause
      })
    ])
    return {
      data: records.map(AnalyticsMapper.toDomain),
      page,
      limit,
      total
    }

  }

  async getLatestRiskScore(userId: string, medicationId: string): Promise<number | null> {
    try {
      const { data } = await this.findByUserMedication(userId, medicationId);

      if (data.length === 0) {
        return null;
      }

      // Sort by date descending and get the latest
      const latest = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
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
