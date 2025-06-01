import { supabaseAdmin } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Create new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  try {
    // Create the auth user with Supabase
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        full_name: name // Adding both for compatibility
      }
    });

    if (signUpError) {
      res.status(400);
      throw new Error(signUpError.message);
    }

    if (!authData.user) {
      res.status(400);
      throw new Error('Failed to create user');
    }

    // Get the automatically created user profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select()
      .eq('id', authData.user.id)
      .single();

    if (fetchError) {
      logger.error(`Error fetching user profile: ${fetchError.message}`);
      // Clean up auth user if profile fetch fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      res.status(400);
      throw new Error('Failed to fetch user profile');
    }

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      id: profile.id,
      name: profile.name,
      email: profile.email
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(400);
    throw error;
  }
});

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