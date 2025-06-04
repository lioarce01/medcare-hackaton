import { supabase } from '../config/db.js';
import { logger } from '../utils/logger.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SENDGRID_FROM = process.env.SENDGRID_FROM || 'your_verified_sender@yourdomain.com'; // Must be verified in SendGrid

export const sendMedicationReminder = async (reminder) => {
  try {
    const { user, medication } = reminder;
    const email = user.email;

    await sgMail.send({
      to: email,
      from: SENDGRID_FROM,
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
    const email = user.email;
    // Create a simple HTML report summary
    const htmlReport = `
      <h2>Your Weekly Medication Adherence Report</h2>
      <p>Hi ${user.name || ''}, here is your medication adherence summary for the past week:</p>
      <pre style="background:#f4f4f4;padding:1em;border-radius:8px;">${JSON.stringify(reportData, null, 2)}</pre>
      <p>Keep up the good work and stay healthy!</p>
    `;

    await sgMail.send({
      to: email,
      from: SENDGRID_FROM,
      subject: 'Your Weekly Medication Adherence Report',
      html: htmlReport
    });

    logger.info(`Sent weekly report email to ${email}`);

    return {
      success: true,
      messageId: `report_${user.id}_${Date.now()}`
    };
  } catch (error) {
    logger.error(`Error sending weekly report: ${error.message}`);
    throw error;
  }
};