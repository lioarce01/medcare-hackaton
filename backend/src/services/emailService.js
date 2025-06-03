import { supabase } from '../config/db.js';
import { logger } from '../utils/logger.js';

// Send medication reminder email
export const sendMedicationReminder = async (reminder) => {
  try {
    const { user, medication } = reminder;
    
    // In a real production environment, you would integrate with a proper email service
    // For now, we'll just log the reminder and mark it as sent
    logger.info(`Would send reminder email to ${user.email} for medication ${medication.name}`);
    
    // Record the email sending attempt in Supabase
    const { error } = await supabase
      .from('reminders')
      .update({
        status: 'sent',
        'channels': {
          email: {
            sent: true,
            sentAt: new Date().toISOString()
          },
          sms: {
            sent: false,
            enabled: false
          }
        }
      })
      .eq('id', reminder.id);

    if (error) throw error;
    
    return {
      success: true,
      messageId: `reminder_${reminder.id}`
    };
  } catch (error) {
    logger.error(`Error sending reminder email: ${error.message}`);
    throw error;
  }
};

// Send weekly adherence report
export const sendWeeklyReport = async (user, reportData) => {
  try {
    // In a real production environment, you would integrate with a proper email service
    // For now, we'll just log the report
    logger.info(`Would send weekly report to ${user.email}`);
    logger.info('Report data:', reportData);
    
    return {
      success: true,
      messageId: `report_${user.id}_${Date.now()}`
    };
  } catch (error) {
    logger.error(`Error sending weekly report: ${error.message}`);
    throw error;
  }
};