import Reminder from '../models/reminderModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMedicationReminder } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

// @desc    Get upcoming reminders for a user
// @route   GET /api/reminders/upcoming
// @access  Private
export const getUpcomingReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  
  // Get reminders for the next 24 hours
  const tomorrow = new Date();
  tomorrow.setHours(now.getHours() + 24);

  const reminders = await Reminder.find({
    user: req.user._id,
    scheduledDate: { $gte: now, $lte: tomorrow },
    status: 'pending'
  }).populate('medication', 'name dosage instructions');

  res.json(reminders);
});

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
export const getAllReminders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const count = await Reminder.countDocuments({ user: req.user._id });
  const reminders = await Reminder.find({ user: req.user._id })
    .populate('medication', 'name dosage')
    .sort({ scheduledDate: -1, scheduledTime: -1 })
    .skip(skip)
    .limit(pageSize);

  res.json({
    reminders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Send a reminder manually
// @route   POST /api/reminders/:id/send
// @access  Private
export const sendReminderManually = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id)
    .populate('medication')
    .populate('user');

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // Check if reminder belongs to user
  if (reminder.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized');
  }

  try {
    await sendMedicationReminder(reminder);
    
    reminder.status = 'sent';
    reminder.channels.email.sent = true;
    reminder.channels.email.sentAt = new Date();
    await reminder.save();
    
    logger.info(`Manual reminder sent for medication: ${reminder.medication.name} to ${reminder.user.email}`);
    
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    logger.error(`Error sending manual reminder: ${error.message}`);
    reminder.status = 'failed';
    reminder.retryCount += 1;
    reminder.lastRetry = new Date();
    await reminder.save();
    
    res.status(500);
    throw new Error('Failed to send reminder');
  }
});

// @desc    Update reminder settings
// @route   PUT /api/reminders/settings
// @access  Private
export const updateReminderSettings = asyncHandler(async (req, res) => {
  const { emailEnabled, preferredTimes } = req.body;
  
  const user = req.user;
  
  if (emailEnabled !== undefined) {
    user.emailNotificationsEnabled = emailEnabled;
  }
  
  if (preferredTimes && Array.isArray(preferredTimes)) {
    user.preferredReminderTime = preferredTimes;
  }
  
  await user.save();
  
  res.json({
    message: 'Reminder settings updated successfully',
    emailNotificationsEnabled: user.emailNotificationsEnabled,
    preferredReminderTime: user.preferredReminderTime,
  });
});