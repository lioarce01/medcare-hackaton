import Medication from '../models/medicationModel.js';
import Adherence from '../models/adherenceModel.js';
import Reminder from '../models/reminderModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { generateAdherenceRecords } from '../services/adherenceService.js';

// @desc    Create a new medication
// @route   POST /api/medications
// @access  Private
export const createMedication = asyncHandler(async (req, res) => {
  const {
    name,
    dosage,
    frequency,
    scheduledTimes,
    instructions,
    startDate,
    endDate,
    refillReminder,
    sideEffectsToWatch,
    medicationType,
    imageUrl,
  } = req.body;

  const medication = await Medication.create({
    user: req.user._id,
    name,
    dosage,
    frequency,
    scheduledTimes,
    instructions,
    startDate,
    endDate,
    refillReminder,
    sideEffectsToWatch,
    medicationType,
    imageUrl,
  });

  if (medication) {
    // Generate adherence records and reminders for the next 7 days
    await generateAdherenceRecords(medication._id, req.user._id);
    logger.info(`Medication created: ${name} for user ${req.user._id}`);
    
    res.status(201).json(medication);
  } else {
    res.status(400);
    throw new Error('Invalid medication data');
  }
});

// @desc    Get all medications for a user
// @route   GET /api/medications
// @access  Private
export const getMedications = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id });
  res.json(medications);
});

// @desc    Get medication by ID
// @route   GET /api/medications/:id
// @access  Private
export const getMedicationById = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  // Check if medication exists and belongs to user
  if (medication && medication.user.toString() === req.user._id.toString()) {
    res.json(medication);
  } else {
    res.status(404);
    throw new Error('Medication not found');
  }
});

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
export const updateMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if medication belongs to user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // Check if scheduled times have changed
  const timesChanged = JSON.stringify(medication.scheduledTimes) !== JSON.stringify(req.body.scheduledTimes);
  
  // Update medication with new data
  Object.keys(req.body).forEach(key => {
    medication[key] = req.body[key];
  });

  const updatedMedication = await medication.save();
  
  // If scheduled times changed, update future adherence records and reminders
  if (timesChanged) {
    // Delete future adherence records and reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Adherence.deleteMany({
      medication: medication._id,
      scheduledDate: { $gte: today },
      status: 'pending'
    });
    
    await Reminder.deleteMany({
      medication: medication._id,
      scheduledDate: { $gte: today },
      status: 'pending'
    });
    
    // Regenerate adherence records and reminders
    await generateAdherenceRecords(medication._id, req.user._id);
  }
  
  logger.info(`Medication updated: ${medication.name} for user ${req.user._id}`);
  res.json(updatedMedication);
});

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
export const deleteMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if medication belongs to user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // Delete associated adherence records and reminders
  await Adherence.deleteMany({ medication: medication._id });
  await Reminder.deleteMany({ medication: medication._id });

  await medication.deleteOne();
  logger.info(`Medication deleted: ${medication.name} for user ${req.user._id}`);
  
  res.json({ message: 'Medication removed' });
});

// @desc    Get active medications for a user
// @route   GET /api/medications/active
// @access  Private
export const getActiveMedications = asyncHandler(async (req, res) => {
  const today = new Date();
  
  const medications = await Medication.find({
    user: req.user._id,
    active: true,
    $or: [
      { endDate: { $gte: today } },
      { endDate: { $exists: false } },
      { endDate: null }
    ]
  });
  
  res.json(medications);
});