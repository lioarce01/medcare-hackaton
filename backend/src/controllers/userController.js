import { supabaseAdmin } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select()
    .eq('id', req.user.id)
    .single();

  if (error || !user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
    allergies: user.allergies,
    conditions: user.conditions,
    isAdmin: user.is_admin,
    preferredReminderTime: user.preferred_reminder_time,
    emailNotificationsEnabled: user.email_notifications_enabled,
    phoneNumber: user.phone_number,
    emergencyContact: user.emergency_contact,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { data: user, error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      name: req.body.name,
      date_of_birth: req.body.dateOfBirth,
      gender: req.body.gender,
      allergies: req.body.allergies,
      conditions: req.body.conditions,
      preferred_reminder_time: req.body.preferredReminderTime,
      email_notifications_enabled: req.body.emailNotificationsEnabled,
      phone_number: req.body.phoneNumber,
      emergency_contact: req.body.emergencyContact,
    })
    .eq('id', req.user.id)
    .select()
    .single();

  if (updateError) {
    res.status(400);
    throw new Error(updateError.message);
  }

  if (user) {
    logger.info(`User profile updated: ${user.email}`);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
      preferredReminderTime: user.preferred_reminder_time,
      emailNotificationsEnabled: user.email_notifications_enabled,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});