import Adherence from '../models/adherenceModel.js';
import Medication from '../models/medicationModel.js';
import { logger } from '../utils/logger.js';

// Generate weekly adherence report data for a user
export const generateWeeklyReport = async (userId) => {
  try {
    // Set date range for the past week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get all adherence records for the past week
    const adherenceRecords = await Adherence.find({
      user: userId,
      scheduledDate: { $gte: oneWeekAgo, $lt: today },
      status: { $in: ['taken', 'missed', 'skipped'] } // Exclude pending
    }).populate('medication', 'name');
    
    // Calculate overall statistics
    const total = adherenceRecords.length;
    const taken = adherenceRecords.filter(record => record.status === 'taken').length;
    const missed = adherenceRecords.filter(record => record.status === 'missed').length;
    const skipped = adherenceRecords.filter(record => record.status === 'skipped').length;
    
    // Group by medication
    const medicationMap = new Map();
    adherenceRecords.forEach(record => {
      const medId = record.medication._id.toString();
      const medName = record.medication.name;
      
      if (!medicationMap.has(medId)) {
        medicationMap.set(medId, {
          id: medId,
          name: medName,
          total: 0,
          taken: 0,
          missed: 0,
          skipped: 0
        });
      }
      
      const medStats = medicationMap.get(medId);
      medStats.total++;
      medStats[record.status]++;
    });
    
    // Convert to array and calculate adherence rates
    const medications = Array.from(medicationMap.values()).map(med => {
      const adherenceRate = med.total > 0 
        ? (med.taken / med.total) * 100 
        : 0;
        
      return {
        ...med,
        adherenceRate
      };
    });
    
    // Group by day for trend analysis
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayRecords = adherenceRecords.filter(record => {
        const recordDate = new Date(record.scheduledDate);
        return recordDate >= date && recordDate < nextDate;
      });
      
      const dayTotal = dayRecords.length;
      const dayTaken = dayRecords.filter(record => record.status === 'taken').length;
      const dayAdherenceRate = dayTotal > 0 ? (dayTaken / dayTotal) * 100 : 0;
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        total: dayTotal,
        taken: dayTaken,
        adherenceRate: dayAdherenceRate
      });
    }
    
    // Format dates for report
    const startDateStr = oneWeekAgo.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    const endDateStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Return compiled report data
    return {
      userId,
      startDate: startDateStr,
      endDate: endDateStr,
      total,
      taken,
      missed,
      skipped,
      adherenceRate: total > 0 ? (taken / total) * 100 : 0,
      medications,
      dailyStats
    };
  } catch (error) {
    logger.error(`Error generating weekly report: ${error.message}`);
    throw error;
  }
};