import { supabaseAdmin } from '../config/db.js';
import { sendMedicationReminder } from './emailService.js';
import { logger } from '../utils/logger.js';

export const scheduleReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    // Obtener recordatorios programados para los próximos 5 minutos
    const { data: reminders, error } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        user_id,
        medication_id,
        scheduled_time,
        scheduled_date,
        status,
        channels,
        message,
        medications (
          name,
          dosage,
          instructions
        ),
        users (
          email,
          subscription_status,
          subscription_expires_at
        )
      `)
      .eq('status', 'pending')
      .eq('scheduled_date', now.toISOString().split('T')[0])
      .gte('scheduled_time', now.toTimeString().slice(0, 5))
      .lte('scheduled_time', fiveMinutesFromNow.toTimeString().slice(0, 5));

    if (error) {
      logger.error('Error fetching reminders:', error);
      return;
    }

    for (const reminder of reminders) {
      try {
        // Verificar si el usuario es premium
        const isPremium = reminder.users.subscription_status === 'premium' && 
                         new Date(reminder.users.subscription_expires_at) > new Date();

        if (!isPremium) {
          logger.info(`User ${reminder.user_id} is not premium, skipping reminder`);
          continue;
        }

        // Enviar recordatorio por email
        await sendMedicationReminder(reminder);

        // Actualizar estado del recordatorio
        const { error: updateError } = await supabaseAdmin
          .from('reminders')
          .update({
            status: 'sent',
            channels: {
              ...reminder.channels,
              email: {
                sent: true,
                enabled: true,
                sentAt: new Date().toISOString()
              }
            },
            last_retry: new Date().toISOString()
          })
          .eq('id', reminder.id);

        if (updateError) {
          logger.error('Error updating reminder status:', updateError);
        }
      } catch (reminderError) {
        logger.error('Error processing reminder:', reminderError);
        
        // Actualizar contador de reintentos
        const { error: retryError } = await supabaseAdmin
          .from('reminders')
          .update({
            retry_count: (reminder.retry_count || 0) + 1,
            last_retry: new Date().toISOString()
          })
          .eq('id', reminder.id);

        if (retryError) {
          logger.error('Error updating retry count:', retryError);
        }
      }
    }
  } catch (error) {
    logger.error('Error in scheduleReminders:', error);
  }
};

export const createReminder = async (userId, medicationId, scheduledTime, scheduledDate, message = null) => {
  try {
    logger.info('Creating reminder with data:', {
      userId,
      medicationId,
      scheduledTime,
      scheduledDate,
      message
    });

    const reminderData = {
      user_id: userId,
      medication_id: medicationId,
      scheduled_time: scheduledTime,
      scheduled_date: scheduledDate,
      status: 'pending',
      channels: {
        sms: { sent: false, enabled: false },
        email: { sent: false, enabled: true }
      },
      message: message,
      retry_count: 0
    };

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating reminder:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in createReminder:', error);
    throw error;
  }
};

export const getUpcomingReminders = async (userId) => {
  try {
    const now = new Date();
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        scheduled_time,
        scheduled_date,
        status,
        channels,
        message,
        medications (
          name,
          dosage,
          instructions
        )
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', now.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      logger.error('Error fetching upcoming reminders:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in getUpcomingReminders:', error);
    throw error;
  }
};

// @desc    Send reminder manually
export const sendReminderManually = async (reminderId, userId) => {
  try {
    // Obtener el recordatorio y verificar que pertenece al usuario
    const { data: reminder, error: fetchError } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        user_id,
        medication_id,
        scheduled_time,
        scheduled_date,
        status,
        channels,
        message,
        medications (
          name,
          dosage,
          instructions
        ),
        users (
          email,
          subscription_status,
          subscription_expires_at
        )
      `)
      .eq('id', reminderId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      logger.error('Error fetching reminder:', fetchError);
      throw new Error('Reminder not found or unauthorized');
    }

    // Verificar si el usuario es premium
    const isPremium = reminder.users.subscription_status === 'premium' && 
                     new Date(reminder.users.subscription_expires_at) > new Date();

    if (!isPremium) {
      throw new Error('Premium subscription required');
    }

    // Enviar el recordatorio por email
    await sendMedicationReminder(reminder);

    // Actualizar estado del recordatorio
    const { error: updateError } = await supabaseAdmin
      .from('reminders')
      .update({
        status: 'sent',
        channels: {
          ...reminder.channels,
          email: {
            sent: true,
            enabled: true,
            sentAt: new Date().toISOString()
          }
        },
        last_retry: new Date().toISOString()
      })
      .eq('id', reminderId);

    if (updateError) {
      logger.error('Error updating reminder status:', updateError);
      throw new Error('Failed to update reminder status');
    }

    return { success: true, message: 'Reminder sent successfully' };
  } catch (error) {
    logger.error('Error in sendReminderManually:', error);
    throw error;
  }
};

// @desc    Update reminder settings
export const updateReminderSettings = async (userId, settings) => {
  try {
    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logger.error('Error fetching user:', userError);
      throw new Error('User not found');
    }

    // Verificar si el usuario tiene suscripción premium
    if (user.subscription_status !== 'premium') {
      throw new Error('Premium subscription required');
    }

    // Actualizar la configuración en la tabla user_settings
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userId,
        email_enabled: settings.emailEnabled,
        preferred_times: settings.preferredTimes,
        timezone: settings.timezone || 'UTC',
        notification_preferences: settings.notificationPreferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      logger.error('Error updating reminder settings:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Settings updated successfully',
      data: {
        emailEnabled: data.email_enabled,
        preferredTimes: data.preferred_times,
        timezone: data.timezone,
        notificationPreferences: data.notification_preferences
      }
    };
  } catch (error) {
    logger.error('Error in updateReminderSettings:', error);
    throw error;
  }
};

// @desc    Get all reminders for a user
export const getAllReminders = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        medication_id,
        scheduled_time,
        scheduled_date,
        status,
        channels,
        message,
        retry_count,
        last_retry,
        medications (
          name,
          dosage,
          instructions
        )
      `)
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      logger.error('Error fetching reminders:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in getAllReminders:', error);
    throw error;
  }
}; 