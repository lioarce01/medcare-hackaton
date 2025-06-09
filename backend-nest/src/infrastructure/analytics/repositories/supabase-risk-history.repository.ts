import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RiskHistoryRepository, RiskHistoryRecord } from '../../../domain/analytics/repositories/risk-history.repository';

@Injectable()
export class SupabaseRiskHistoryRepository implements RiskHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(record: RiskHistoryRecord): Promise<void> {
    try {
      // For now, we'll store risk history in a simple JSON format in user_settings
      // In a production app, you'd want a dedicated risk_history table
      
      // Check if record already exists for this date
      const existing = await this.prisma.$queryRaw`
        SELECT id FROM user_settings 
        WHERE user_id = ${record.user_id}::uuid
      `;

      if (existing && (existing as any[]).length > 0) {
        // Update existing record with risk score data
        await this.prisma.$executeRaw`
          UPDATE user_settings 
          SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || 
              jsonb_build_object(
                'risk_history', 
                COALESCE(notification_preferences->'risk_history', '[]'::jsonb) || 
                jsonb_build_array(jsonb_build_object(
                  'medication_id', ${record.medication_id},
                  'date', ${record.date},
                  'risk_score', ${record.risk_score}
                ))
              )
          WHERE user_id = ${record.user_id}::uuid
        `;
      } else {
        // Create user_settings record if it doesn't exist
        await this.prisma.user_settings.create({
          data: {
            user_id: record.user_id,
            email_enabled: true,
            preferred_times: ['08:00', '14:00', '20:00'],
            timezone: 'UTC',
            notification_preferences: {
              risk_history: [{
                medication_id: record.medication_id,
                date: record.date,
                risk_score: record.risk_score
              }]
            }
          }
        });
      }
    } catch (error) {
      console.error('Error creating risk history record:', error);
      throw error;
    }
  }

  async findByUserMedication(
    userId: string, 
    medicationId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<RiskHistoryRecord[]> {
    try {
      const settings = await this.prisma.user_settings.findUnique({
        where: { user_id: userId },
        select: { notification_preferences: true }
      });

      if (!settings?.notification_preferences) {
        return [];
      }

      const riskHistory = (settings.notification_preferences as any)?.risk_history || [];
      
      return riskHistory
        .filter((record: any) => {
          if (record.medication_id !== medicationId) return false;
          if (startDate && record.date < startDate) return false;
          if (endDate && record.date > endDate) return false;
          return true;
        })
        .map((record: any) => ({
          user_id: userId,
          medication_id: record.medication_id,
          date: record.date,
          risk_score: record.risk_score
        }));
    } catch (error) {
      console.error('Error finding risk history by user medication:', error);
      return [];
    }
  }

  async findByUser(userId: string, startDate?: string, endDate?: string): Promise<RiskHistoryRecord[]> {
    try {
      const settings = await this.prisma.user_settings.findUnique({
        where: { user_id: userId },
        select: { notification_preferences: true }
      });

      if (!settings?.notification_preferences) {
        return [];
      }

      const riskHistory = (settings.notification_preferences as any)?.risk_history || [];
      
      return riskHistory
        .filter((record: any) => {
          if (startDate && record.date < startDate) return false;
          if (endDate && record.date > endDate) return false;
          return true;
        })
        .map((record: any) => ({
          user_id: userId,
          medication_id: record.medication_id,
          date: record.date,
          risk_score: record.risk_score
        }));
    } catch (error) {
      console.error('Error finding risk history by user:', error);
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
      const latest = records.sort((a, b) => b.date.localeCompare(a.date))[0];
      return latest.risk_score;
    } catch (error) {
      console.error('Error getting latest risk score:', error);
      return null;
    }
  }
}
