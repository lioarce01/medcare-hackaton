import { supabase } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMedicationReminder = async (reminder) => {
  try {
    const { user, medication } = reminder;
    const email = user.email;
    
    await resend.emails.send({
      from: 'lioarce1@gmail.com',
      to: email,
      subject: `Medication Reminder: ${medication.name}`,
      html: `<p>Hi, this is your reminder to take <b>${medication.name}</b> at the scheduled time.</p>`
    });

    logger.info(`Sent reminder email to ${email} for medication ${medication.name}`);
    
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