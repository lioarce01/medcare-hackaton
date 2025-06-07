import Reminder from '../models/reminderModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMedicationReminder } from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { 
  createReminder as createReminderService, 
  getUpcomingReminders as getUpcomingRemindersService, 
  getAllReminders as getAllRemindersService,
  sendReminderManually as sendReminderManuallyService,
  updateReminderSettings as updateReminderSettingsService
} from '../services/reminderService.js';
import { supabaseAdmin } from '../config/db.js';

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
export const getAllReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await getAllRemindersService(userId);
    res.json(reminders);
  } catch (error) {
    logger.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Error fetching reminders' });
  }
};

// @desc    Get upcoming reminders for a user
// @route   GET /api/reminders/upcoming
// @access  Private/Premium
export const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await getUpcomingRemindersService(userId);
    res.json(reminders);
  } catch (error) {
    logger.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ error: 'Error fetching upcoming reminders' });
  }
};

// @desc    Send reminder manually
// @route   POST /api/reminders/:id/send
// @access  Private/Premium
export const sendReminderManually = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await sendReminderManuallyService(id, userId);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error sending reminder:', error);
    if (error.message === 'Reminder not found or unauthorized') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Premium subscription required') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error sending reminder' });
  }
};

// @desc    Update reminder settings
// @route   PUT /api/reminders/settings
// @access  Private/Premium
export const updateReminderSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body; // Los settings vienen directamente en el body

    logger.info('Updating settings for user:', userId, 'with data:', settings);

    const result = await updateReminderSettingsService(userId, settings);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error updating reminder settings:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Premium subscription required') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ 
      error: 'Error updating reminder settings',
      details: error.message 
    });
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private/Premium
export const createReminder = async (req, res) => {
  try {
    const { medication_id, scheduled_time, scheduled_date, message } = req.body;
    const userId = req.user.id;

    const reminder = await createReminderService(
      userId,
      medication_id,
      scheduled_time,
      scheduled_date,
      message
    );

    res.status(201).json(reminder);
  } catch (error) {
    logger.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Error creating reminder' });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting reminder:', error);
      throw new Error('Failed to delete reminder');
    }

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteReminder:', error);
    if (error.message === 'Failed to delete reminder') {
      return res.status(404).json({ error: 'Reminder not found or unauthorized' });
    }
    res.status(500).json({ error: 'Error deleting reminder' });
  }
};

// @desc    Get user settings
// @route   GET /api/reminders/settings
// @access  Private
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info('Getting settings for user:', userId);

    // Obtener la configuración del usuario
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    logger.info('Supabase response:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('No settings found, creating default settings');
        // Si no existe la configuración, crear una con valores por defecto
        const defaultSettings = {
          user_id: userId,
          email_enabled: true,
          preferred_times: ['08:00', '14:00', '20:00'],
          timezone: 'UTC',
          notification_preferences: {
            email: true,
            push: false
          }
        };

        logger.info('Inserting default settings:', defaultSettings);

        const { data: newSettings, error: insertError } = await supabaseAdmin
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) {
          logger.error('Error creating default settings:', insertError);
          throw new Error('Failed to create default settings');
        }

        logger.info('Default settings created successfully:', newSettings);

        return res.json({
          emailEnabled: newSettings.email_enabled,
          preferredTimes: newSettings.preferred_times,
          timezone: newSettings.timezone,
          notificationPreferences: newSettings.notification_preferences
        });
      }
      logger.error('Error fetching user settings:', error);
      throw error;
    }

    logger.info('Returning existing settings:', data);

    res.json({
      emailEnabled: data.email_enabled,
      preferredTimes: data.preferred_times,
      timezone: data.timezone,
      notificationPreferences: data.notification_preferences
    });
  } catch (error) {
    logger.error('Error in getUserSettings:', error);
    res.status(500).json({ 
      error: 'Error fetching user settings',
      details: error.message 
    });
  }
};