import cron from 'node-cron';
import { findUsersByFilter } from '../models/userModel.js';
import { findPendingReminders, updateReminder } from '../models/reminderModel.js';
import { logger } from '../utils/logger.js';
import { sendMedicationReminder, sendWeeklyReport } from './emailService.js';
import { processMissedAdherenceRecords } from './adherenceService.js';
import { generateWeeklyReport } from './reportService.js';

// Set up cron jobs for the application
export const setupCronJobs = () => {
  // Check for reminders to send every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Running reminder check job');
      await processReminders();
    } catch (error) {
      logger.error(`Error in reminder check job: ${error.message}`);
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

  logger.info('All scheduled jobs have been set up');
};

// Process due reminders
const processReminders = async () => {
  const now = new Date();
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
  
  // Format current time and five minutes later for query
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const fiveMinutesLaterStr = `${fiveMinutesLater.getHours().toString().padStart(2, '0')}:${fiveMinutesLater.getMinutes().toString().padStart(2, '0')}`;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Find reminders directly filtered by time range in the database query
    const remindersToSend = await findPendingReminders(
      null, // userId not needed as we're getting all pending reminders
      today,
      currentTimeStr,
      fiveMinutesLaterStr
    );
    
    logger.info(`Found ${remindersToSend.length} reminders to send`);
    
    // Process each reminder
    for (const reminder of remindersToSend) {
      // Skip if user has disabled email notifications
      if (!reminder.user.email_notifications_enabled) {
        await updateReminder(reminder.id, reminder.user_id, {
          status: 'skipped'
        });
        continue;
      }
      
      try {
        // Send email reminder
        await sendMedicationReminder(reminder);
        
        // Update reminder status
        await updateReminder(reminder.id, reminder.user_id, {
          status: 'sent',
          channels: {
            ...reminder.channels,
            email: {
              sent: true,
              enabled: true,
              sentAt: new Date().toISOString()
            }
          }
        });
        
        logger.info(`Sent reminder for ${reminder.medication.name} to ${reminder.user.email}`);
      } catch (error) {
        logger.error(`Failed to send reminder: ${error.message}`);
        
        // Update reminder status
        await updateReminder(reminder.id, reminder.user_id, {
          status: 'failed',
          retry_count: (reminder.retry_count || 0) + 1,
          last_retry: new Date().toISOString()
        });
      }
    }
    
    return remindersToSend.length;
  } catch (error) {
    logger.error(`Error processing reminders: ${error.message}`);
    throw error;
  }
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