import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../../domain/user/repositories/user.repository';
import { MedicationRepository } from '../../../domain/medication/repositories/medication.repository';
import { AdherenceRepository } from '../../../domain/adherence/repositories/adherence.repository';
import {
  RiskHistoryRepository,
  RiskHistoryRecord,
} from '../../../domain/analytics/repositories/risk-history.repository';

export interface RiskScoreCalculationResult {
  usersProcessed: number;
  medicationsProcessed: number;
  riskScoresCalculated: number;
  errors: number;
}

@Injectable()
export class CalculateDailyRiskScoresUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    @Inject('RiskHistoryRepository')
    private readonly riskHistoryRepository: RiskHistoryRepository,
  ) {}

  async execute(): Promise<RiskScoreCalculationResult> {
    let usersProcessed = 0;
    let medicationsProcessed = 0;
    let riskScoresCalculated = 0;
    let errors = 0;

    try {
      const users = await this.userRepository.findAll();
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      for (const user of users) {
        try {
          usersProcessed++;

          // Only process premium users (as per Express logic)
          if (user.subscription_status !== 'premium') {
            continue;
          }

          const medications = await this.medicationRepository.findActiveByUser(
            user.id,
          );

          for (const medication of medications) {
            try {
              medicationsProcessed++;

              // Calculate risk score for this user-medication combination
              const riskScore = await this.calculateRiskScore(
                user.id,
                medication.id,
              );

              // Store the risk score
              await this.storeRiskScore(
                user.id,
                medication.id,
                today,
                riskScore,
              );

              riskScoresCalculated++;
              console.log(
                `✅ Risk score calculated: user ${user.id}, med ${medication.id}, score ${riskScore.toFixed(2)}`,
              );
            } catch (medError) {
              console.error(
                `❌ Error calculating risk for med ${medication.id} user ${user.id}:`,
                medError,
              );
              errors++;
            }
          }
        } catch (userError) {
          console.error(`❌ Error processing user ${user.id}:`, userError);
          errors++;
        }
      }

      console.log(
        `Daily risk score calculation completed: ${usersProcessed} users, ${medicationsProcessed} medications, ${riskScoresCalculated} scores calculated, ${errors} errors`,
      );

      return {
        usersProcessed,
        medicationsProcessed,
        riskScoresCalculated,
        errors,
      };
    } catch (error) {
      console.error('Error in daily risk score calculation:', error);
      throw error;
    }
  }

  private async calculateRiskScore(
    userId: string,
    medicationId: string,
  ): Promise<number> {
    try {
      // Get adherence data for the last 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const adherenceRecords =
        await this.adherenceRepository.findByUserMedicationDateRange(
          userId,
          medicationId,
          fourteenDaysAgo.toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
        );

      // Filter only 'taken' records (successful adherence)
      const takenRecords = adherenceRecords.filter(
        (record) => record.status === 'taken',
      );

      // Calculate risk score based on adherence rate
      // Expected doses in 14 days (assuming daily medication for simplicity)
      const expectedDoses = 14;
      const takenDoses = takenRecords.length;

      // Risk score: 0 = no risk (100% adherence), 1 = maximum risk (0% adherence)
      const riskScore = Math.min(
        1,
        Math.max(0, 1 - takenDoses / expectedDoses),
      );

      return riskScore;
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 0.5; // Default medium risk if calculation fails
    }
  }

  private async storeRiskScore(
    userId: string,
    medicationId: string,
    date: string,
    riskScore: number,
  ): Promise<void> {
    try {
      const riskRecord: RiskHistoryRecord = {
        user_id: userId,
        medication_id: medicationId,
        date,
        risk_score: riskScore,
      };

      // Store in risk_history table (we'll need to implement this repository)
      await this.riskHistoryRepository.create(riskRecord);
    } catch (error) {
      console.error('Error storing risk score:', error);
      throw error;
    }
  }
}
