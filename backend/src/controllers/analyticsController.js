import Adherence from '../models/adherenceModel.js';
import Medication from '../models/medicationModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateRiskScore } from '../services/mlService.js';

// @desc    Get adherence statistics
// @route   GET /api/analytics/adherence
// @access  Private
export const getAdherenceStats = asyncHandler(async (req, res) => {
  // Default to last 30 days if not specified
  let startDate = req.query.startDate 
    ? new Date(req.query.startDate) 
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
  let endDate = req.query.endDate 
    ? new Date(req.query.endDate) 
    : new Date();
  
  // Get all adherence records for the period
  const adherenceRecords = await Adherence.find({
    user: req.user._id,
    scheduledDate: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate statistics
  const total = adherenceRecords.length;
  const taken = adherenceRecords.filter(record => record.status === 'taken').length;
  const missed = adherenceRecords.filter(record => record.status === 'missed').length;
  const skipped = adherenceRecords.filter(record => record.status === 'skipped').length;
  const pending = adherenceRecords.filter(record => record.status === 'pending').length;
  
  // Calculate adherence rate (exclude skipped and pending from calculation)
  const adherenceRate = total - pending - skipped > 0 
    ? (taken / (total - pending - skipped)) * 100 
    : 0;
  
  // Get adherence by day of week
  const dayOfWeekStats = [0, 0, 0, 0, 0, 0, 0].map((_, index) => {
    const dayRecords = adherenceRecords.filter(record => {
      const recordDate = new Date(record.scheduledDate);
      return recordDate.getDay() === index;
    });
    
    const dayTotal = dayRecords.length;
    const dayTaken = dayRecords.filter(record => record.status === 'taken').length;
    const dayRate = dayTotal > 0 ? (dayTaken / dayTotal) * 100 : 0;
    
    return {
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      total: dayTotal,
      taken: dayTaken,
      rate: dayRate
    };
  });
  
  // Get adherence by medication
  const medications = await Medication.find({ user: req.user._id });
  
  const medicationStats = await Promise.all(medications.map(async (medication) => {
    const medRecords = adherenceRecords.filter(record => 
      record.medication.toString() === medication._id.toString()
    );
    
    const medTotal = medRecords.length;
    const medTaken = medRecords.filter(record => record.status === 'taken').length;
    const medMissed = medRecords.filter(record => record.status === 'missed').length;
    const medSkipped = medRecords.filter(record => record.status === 'skipped').length;
    const medPending = medRecords.filter(record => record.status === 'pending').length;
    
    // Calculate adherence rate (exclude skipped and pending)
    const medRate = medTotal - medPending - medSkipped > 0 
      ? (medTaken / (medTotal - medPending - medSkipped)) * 100 
      : 0;
    
    // Calculate risk score
    const riskScore = await calculateRiskScore(medication._id, req.user._id);
    
    return {
      _id: medication._id,
      name: medication.name,
      total: medTotal,
      taken: medTaken,
      missed: medMissed,
      skipped: medSkipped,
      pending: medPending,
      adherenceRate: medRate,
      riskScore
    };
  }));
  
  // Calculate trends (last 4 weeks)
  const weeklyTrends = [];
  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(endDate);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekRecords = adherenceRecords.filter(record => {
      const recordDate = new Date(record.scheduledDate);
      return recordDate >= weekStart && recordDate < weekEnd;
    });
    
    const weekTotal = weekRecords.length;
    const weekTaken = weekRecords.filter(record => record.status === 'taken').length;
    const weekMissed = weekRecords.filter(record => record.status === 'missed').length;
    const weekRate = weekTotal > 0 ? (weekTaken / weekTotal) * 100 : 0;
    
    weeklyTrends.push({
      week: `Week ${4 - i}`,
      startDate: weekStart,
      endDate: weekEnd,
      total: weekTotal,
      taken: weekTaken,
      missed: weekMissed,
      adherenceRate: weekRate
    });
  }
  
  res.json({
    overall: {
      total,
      taken,
      missed,
      skipped,
      pending,
      adherenceRate
    },
    dayOfWeekStats,
    medicationStats,
    weeklyTrends,
  });
});

// @desc    Get adherence timeline (daily records)
// @route   GET /api/analytics/timeline
// @access  Private
export const getAdherenceTimeline = asyncHandler(async (req, res) => {
  // Default to last 30 days if not specified
  let startDate = req.query.startDate 
    ? new Date(req.query.startDate) 
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
  let endDate = req.query.endDate 
    ? new Date(req.query.endDate) 
    : new Date();
  
  // Get all adherence records for the period
  const adherenceRecords = await Adherence.find({
    user: req.user._id,
    scheduledDate: { $gte: startDate, $lte: endDate }
  }).populate('medication', 'name');
  
  // Group records by date
  const timeline = [];
  const dateMap = new Map();
  
  adherenceRecords.forEach(record => {
    const date = record.scheduledDate.toISOString().split('T')[0];
    
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        total: 0,
        taken: 0,
        missed: 0,
        skipped: 0,
        pending: 0,
        medications: {}
      });
    }
    
    const dateData = dateMap.get(date);
    dateData.total += 1;
    dateData[record.status] += 1;
    
    const medId = record.medication._id.toString();
    const medName = record.medication.name;
    
    if (!dateData.medications[medId]) {
      dateData.medications[medId] = {
        id: medId,
        name: medName,
        total: 0,
        taken: 0,
        missed: 0,
        skipped: 0,
        pending: 0
      };
    }
    
    dateData.medications[medId].total += 1;
    dateData.medications[medId][record.status] += 1;
  });
  
  // Convert map to array and calculate adherence rates
  dateMap.forEach(data => {
    // Calculate overall adherence rate for the day
    data.adherenceRate = data.total - data.pending - data.skipped > 0
      ? (data.taken / (data.total - data.pending - data.skipped)) * 100
      : 0;
      
    // Calculate adherence rate for each medication
    Object.values(data.medications).forEach(med => {
      med.adherenceRate = med.total - med.pending - med.skipped > 0
        ? (med.taken / (med.total - med.pending - med.skipped)) * 100
        : 0;
    });
    
    // Convert medications object to array
    data.medications = Object.values(data.medications);
    timeline.push(data);
  });
  
  // Sort by date
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.json(timeline);
});

// @desc    Get risk predictions for all medications
// @route   GET /api/analytics/risks
// @access  Private
export const getRiskPredictions = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ 
    user: req.user._id,
    active: true
  });
  
  const riskPredictions = await Promise.all(medications.map(async (medication) => {
    const riskScore = await calculateRiskScore(medication._id, req.user._id);
    
    // Get recent adherence for this medication
    const recentAdherence = await Adherence.find({
      medication: medication._id,
      user: req.user._id,
      status: { $in: ['taken', 'missed'] }
    })
    .sort({ scheduledDate: -1 })
    .limit(10);
    
    const missedCount = recentAdherence.filter(record => record.status === 'missed').length;
    const takenCount = recentAdherence.filter(record => record.status === 'taken').length;
    
    return {
      medicationId: medication._id,
      medicationName: medication.name,
      riskScore,
      riskLevel: riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High',
      recentMissedCount: missedCount,
      recentTakenCount: takenCount,
      adherenceRate: recentAdherence.length > 0 
        ? (takenCount / recentAdherence.length) * 100 
        : 0,
      factors: generateRiskFactors(riskScore, missedCount, medication)
    };
  }));
  
  res.json(riskPredictions);
});

// Helper function to generate risk factors based on the risk score
const generateRiskFactors = (riskScore, missedCount, medication) => {
  const factors = [];
  
  if (missedCount > 3) {
    factors.push('Multiple missed doses recently');
  }
  
  if (medication.frequency.timesPerDay > 2) {
    factors.push('Complex dosing schedule');
  }
  
  if (medication.scheduledTimes.length > 2) {
    factors.push('Multiple doses throughout the day');
  }
  
  if (riskScore > 50) {
    factors.push('Inconsistent adherence pattern');
  }
  
  return factors;
};