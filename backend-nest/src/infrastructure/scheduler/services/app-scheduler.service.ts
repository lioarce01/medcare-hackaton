import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessMissedAdherenceUseCase } from '../../../application/adherence/use-cases/process-missed-adherence.usecase';
import { CalculateDailyRiskScoresUseCase } from '../../../application/analytics/use-cases/calculate-daily-risk-scores.usecase';
import { GenerateWeeklyReportsUseCase } from '../../../application/reports/use-cases/generate-weekly-reports.usecase';

@Injectable()
export class AppSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AppSchedulerService.name);

  constructor(
    private readonly processMissedAdherenceUseCase: ProcessMissedAdherenceUseCase,
    private readonly calculateDailyRiskScoresUseCase: CalculateDailyRiskScoresUseCase,
    private readonly generateWeeklyReportsUseCase: GenerateWeeklyReportsUseCase,
  ) {}

  onModuleInit() {
    this.logger.log('App Scheduler Service initialized - All cron jobs are set up');
  }

  /**
   * Process missed adherence records every hour
   * Marks pending adherence records as "missed" after cutoff time
   */
  @Cron('0 * * * *', {
    name: 'process-missed-adherence',
    timeZone: 'UTC',
  })
  async handleMissedAdherenceProcessing() {
    try {
      this.logger.log('Running missed adherence processing job');
      const result = await this.processMissedAdherenceUseCase.execute();
      this.logger.log(`Missed adherence job completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Error in missed adherence job: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate daily risk scores at 3 AM UTC
   * Calculates risk scores based on adherence patterns for premium users
   */
  @Cron('0 3 * * *', {
    name: 'calculate-daily-risk-scores',
    timeZone: 'UTC',
  })
  async handleDailyRiskScoreCalculation() {
    try {
      this.logger.log('Running daily risk score calculation job');
      const result = await this.calculateDailyRiskScoresUseCase.execute();
      this.logger.log(`Daily risk score job completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Error in daily risk score job: ${error.message}`, error.stack);
    }
  }

  /**
   * Generate and send weekly reports on Sundays at 9 AM UTC
   * Sends weekly adherence reports to users with email notifications enabled
   */
  @Cron('0 9 * * 0', {
    name: 'generate-weekly-reports',
    timeZone: 'UTC',
  })
  async handleWeeklyReportGeneration() {
    try {
      this.logger.log('Running weekly report generation job');
      const result = await this.generateWeeklyReportsUseCase.execute();
      this.logger.log(`Weekly report job completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Error in weekly report job: ${error.message}`, error.stack);
    }
  }

  // Manual trigger methods for testing
  async triggerMissedAdherenceProcessing() {
    this.logger.log('Manually triggering missed adherence processing');
    return this.processMissedAdherenceUseCase.execute();
  }

  async triggerDailyRiskScoreCalculation() {
    this.logger.log('Manually triggering daily risk score calculation');
    return this.calculateDailyRiskScoresUseCase.execute();
  }

  async triggerWeeklyReportGeneration() {
    this.logger.log('Manually triggering weekly report generation');
    return this.generateWeeklyReportsUseCase.execute();
  }
}
