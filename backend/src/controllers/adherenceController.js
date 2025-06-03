import { 
  createAdherenceRecord,
  findAdherenceById,
  findAdherenceByDate,
  updateAdherenceRecord,
  aggregateAdherenceStats
} from '../models/adherenceModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Mark medication as taken
// @route   POST /api/adherence/confirm
// @access  Private
export const confirmMedicationTaken = asyncHandler(async (req, res) => {
  const { medicationId, adherenceId, notes, sideEffects, dosageTaken } = req.body;
  
  let adherenceRecord;
  
  if (adherenceId) {
    // If adherenceId is provided, find and update that specific record
    adherenceRecord = await findAdherenceById(adherenceId, req.user.id);
    
    if (!adherenceRecord) {
      res.status(404);
      throw new Error('Adherence record not found');
    }
  } else if (medicationId) {
    // Find the latest pending adherence record for this medication
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const todayRecords = await findAdherenceByDate(req.user.id, today);
    adherenceRecord = todayRecords.find(record => 
      record.medication_id === medicationId && 
      record.status === 'pending'
    );
    
    if (!adherenceRecord) {
      res.status(404);
      throw new Error('No pending doses found for this medication');
    }
  } else {
    res.status(400);
    throw new Error('Either medicationId or adherenceId must be provided');
  }
  
  // Update the adherence record
  const updates = {
    status: 'taken',
    taken_time: new Date().toISOString(),
    notes: notes || adherenceRecord.notes,
    side_effects_reported: sideEffects || adherenceRecord.side_effects_reported,
    dosage_taken: dosageTaken || adherenceRecord.dosage_taken
  };
  
  const updatedRecord = await updateAdherenceRecord(
    adherenceRecord.id,
    req.user.id,
    updates
  );
  
  logger.info(`Medication marked as taken: ${adherenceRecord.medication_id} by user ${req.user.id}`);
  
  res.json({
    success: true,
    message: 'Medication marked as taken',
    adherenceRecord: updatedRecord,
  });
});

// @desc    Mark medication as skipped
// @route   POST /api/adherence/skip
// @access  Private
export const skipMedication = asyncHandler(async (req, res) => {
  const { adherenceId, reason } = req.body;
  
  const adherenceRecord = await findAdherenceById(adherenceId, req.user.id);
  
  if (!adherenceRecord) {
    res.status(404);
    throw new Error('Adherence record not found');
  }
  
  const updates = {
    status: 'skipped',
    notes: reason || adherenceRecord.notes,
    taken_time: new Date().toISOString()
  };
  
  const updatedRecord = await updateAdherenceRecord(
    adherenceId,
    req.user.id,
    updates
  );
  
  logger.info(`Medication marked as skipped: ${adherenceRecord.medication_id} by user ${req.user.id}`);
  
  res.json({
    success: true,
    message: 'Medication marked as skipped',
    adherenceRecord: updatedRecord,
  });
});

// @desc    Get today's adherence records
// @route   GET /api/adherence/today
// @access  Private
export const getTodayAdherence = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const adherenceRecords = await findAdherenceByDate(req.user.id, today);
  
  res.json(adherenceRecords);
});

// @desc    Get adherence history
// @route   GET /api/adherence/history
// @access  Private
export const getAdherenceHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  
  // Default to last 30 days if not specified
  const startDate = req.query.startDate 
    ? req.query.startDate
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
  const endDate = req.query.endDate 
    ? req.query.endDate
    : new Date().toISOString().split('T')[0];
  
  const adherenceRecords = await findAdherenceByDate(req.user.id, startDate, endDate);
  
  // Manual pagination since we're using Supabase
  const start = (page - 1) * pageSize;
  const paginatedRecords = adherenceRecords.slice(start, start + pageSize);
  
  const stats = await aggregateAdherenceStats(req.user.id, startDate, endDate);
  
  res.json({
    adherenceRecords: paginatedRecords,
    page,
    pages: Math.ceil(adherenceRecords.length / pageSize),
    total: adherenceRecords.length,
    stats
  });
});

// @desc    Get adherence stats
// @route   GET /api/adherence/stats
// @access  Private
export const getAdherenceStats = asyncHandler(async (req, res) => {
  const startDate = req.query.startDate || 
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = req.query.endDate || 
    new Date().toISOString().split('T')[0];
  
  const stats = await aggregateAdherenceStats(req.user.id, startDate, endDate);
  
  res.json(stats);
});

export const createAdherence = asyncHandler(async (req, res) => {
  const adherenceData = {
    ...req.body,
    user_id: req.user.id,
    status: 'pending'
  };
  
  const newAdherence = await createAdherenceRecord(adherenceData);
  
  res.status(201).json(newAdherence);
});