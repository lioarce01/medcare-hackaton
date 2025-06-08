import cron from 'node-cron';
import { findUsersByFilter } from '../models/userModel.js';
import { logger } from '../utils/logger.js';
import { sendWeeklyReport } from './emailService.js';
import { generateAdherenceRecords, processMissedAdherenceRecords } from './adherenceService.js';
import { generateWeeklyReport } from './reportService.js';
import medicationModel from '../models/medicationModel.js';
import { scheduleReminders } from './reminderService.js';
import { calculateAndStoreDailyRiskScores } from './riskScoreService.js';

// Set up cron jobs for the application
export const setupCronJobs = () => {
  // Reminder Job - Ejecutar cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('Running reminder check job');
      await scheduleReminders();
    } catch (error) {
      logger.error(`Error in reminder job: ${error.message}`);
    }
  });

  // Reminder job - Ejecutar cada 3 horas
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running daily risk_score job');
      await calculateAndStoreDailyRiskScores();
    } catch (error) {
      logger.error(`Error in risk_score job: ${error.message}`);
    }    
  });

  // Process missed adherence records every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running missed adherence processing job');
      await processMissedAdherenceRecords();
    } catch (error) {
      logger.error(`Error in missed adherence job: ${error.message}`);
    }
  });

  // Generate and send weekly reports on Sunday at 9 AM
  cron.schedule('0 9 * * 0', async () => {
    try {
      logger.info('Running weekly report generation job');
      await generateAndSendWeeklyReports();
    } catch (error) {
      logger.error(`Error in weekly report job: ${error.message}`);
    }
  });

  // Cron job diario para generar adherencia futura
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Running daily adherence generation job');
      const users = await findUsersByFilter({});
      for (const user of users) {
        const medications = await medicationModel.findActiveMedications(user.id);
        for (const med of medications) {
          try {
            await generateAdherenceRecords(med.id, user.id);
          } catch (err) {
            logger.error(`Error generating adherence for med ${med.id} user ${user.id}: ${err.message}`);
          }
        }
      }
      logger.info('Daily adherence generation job completed');
    } catch (error) {
      logger.error(`Error in daily adherence generation job: ${error.message}`);
    }
  });

  logger.info('All cron jobs have been set up successfully');
};

// Generate and send weekly reports for all users
const generateAndSendWeeklyReports = async () => {
  try {
    // Get all users with email notifications enabled
    const users = await findUsersByFilter({ email_notifications_enabled: true });
    logger.info(`Generating weekly reports for ${users.length} users`);
    
    for (const user of users) {
      try {
        // Generate report data for the past week
        const reportData = await generateWeeklyReport(user.id);
        
        // Send report email
        await sendWeeklyReport(user, reportData);
        
        logger.info(`Sent weekly report to ${user.email}`);
      } catch (error) {
        logger.error(`Error sending report for user ${user.email}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in weekly report generation: ${error.message}`);
    throw error;
  }
};