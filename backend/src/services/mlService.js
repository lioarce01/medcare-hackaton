import Adherence from '../models/adherenceModel.js';
import KNN from 'ml-knn';
import { logger } from '../utils/logger.js';

// Calculate risk score for a medication
export const calculateRiskScore = async (medicationId, userId) => {
  try {
    // Get adherence history for this medication
    const adherenceHistory = await Adherence.find({
      medication: medicationId,
      user: userId,
      status: { $in: ['taken', 'missed'] } // Only consider completed records
    }).sort({ scheduledDate: -1 });
    
    // If we don't have enough history, return a default risk score
    if (adherenceHistory.length < 5) {
      return 30; // Default medium-low risk
    }
    
    // Calculate basic adherence rate
    const totalRecords = adherenceHistory.length;
    const missedRecords = adherenceHistory.filter(record => record.status === 'missed').length;
    const adherenceRate = ((totalRecords - missedRecords) / totalRecords) * 100;
    
    // Calculate recent trend (last 7 records)
    const recentRecords = adherenceHistory.slice(0, Math.min(7, totalRecords));
    const recentMissed = recentRecords.filter(record => record.status === 'missed').length;
    const recentRate = ((recentRecords.length - recentMissed) / recentRecords.length) * 100;
    
    // Calculate trend direction (is adherence improving or declining?)
    const trendFactor = recentRate - adherenceRate;
    
    // Calculate patterns - are misses random or consecutive?
    let consecutiveMissesMax = 0;
    let currentConsecutive = 0;
    
    for (const record of adherenceHistory) {
      if (record.status === 'missed') {
        currentConsecutive++;
        consecutiveMissesMax = Math.max(consecutiveMissesMax, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
    
    // Timing patterns - are certain times more likely to be missed?
    const timeSlots = {};
    adherenceHistory.forEach(record => {
      const hour = record.scheduledTime.split(':')[0];
      if (!timeSlots[hour]) {
        timeSlots[hour] = { total: 0, missed: 0 };
      }
      
      timeSlots[hour].total++;
      if (record.status === 'missed') {
        timeSlots[hour].missed++;
      }
    });
    
    // Find the worst time slot
    let worstTimeSlot = 0;
    let worstTimeSlotRate = 0;
    
    Object.entries(timeSlots).forEach(([hour, data]) => {
      const missRate = data.total > 0 ? (data.missed / data.total) * 100 : 0;
      if (missRate > worstTimeSlotRate) {
        worstTimeSlotRate = missRate;
        worstTimeSlot = hour;
      }
    });
    
    // Calculate risk score components
    const adherenceComponent = Math.max(0, 100 - adherenceRate);
    const recentComponent = Math.max(0, 100 - recentRate);
    const trendComponent = trendFactor < 0 ? Math.min(25, Math.abs(trendFactor)) : 0;
    const consecutiveComponent = consecutiveMissesMax * 10;
    const timeSlotComponent = worstTimeSlotRate / 2;
    
    // Combine components with weighting
    let riskScore = (
      (adherenceComponent * 0.3) +
      (recentComponent * 0.3) +
      (trendComponent * 0.15) +
      (consecutiveComponent * 0.15) +
      (timeSlotComponent * 0.1)
    );
    
    // Normalize to 0-100 range
    riskScore = Math.min(100, Math.max(0, riskScore));
    
    logger.debug(`Calculated risk score for medication ${medicationId}: ${riskScore}`);
    return Math.round(riskScore);
  } catch (error) {
    logger.error(`Error calculating risk score: ${error.message}`);
    return 50; // Default medium risk if calculation fails
  }
};

// Basic KNN model for predicting dropout risk (demonstration purposes)
export const predictDropoutRisk = async (userId) => {
  try {
    // In a real system, we would have a properly trained model
    // This is a simplified example for demonstration
    
    // Get all user's medications
    const adherenceData = await Adherence.aggregate([
      { $match: { user: userId } },
      { $group: {
        _id: '$medication',
        total: { $sum: 1 },
        missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } }
      }}
    ]);
    
    if (adherenceData.length === 0) {
      return {
        predictionScore: 0.5,
        confidence: 'low',
        explanation: 'Not enough data to make a reliable prediction'
      };
    }
    
    // Create a simple feature matrix
    // Features: [missRate, totalDoses, consecutiveMisses]
    const features = await Promise.all(adherenceData.map(async (med) => {
      const missRate = med.total > 0 ? med.missed / med.total : 0;
      
      // Get consecutive misses
      const adherenceRecords = await Adherence.find({
        medication: med._id,
        user: userId
      }).sort({ scheduledDate: 1, scheduledTime: 1 });
      
      let consecutiveMissesMax = 0;
      let currentConsecutive = 0;
      
      for (const record of adherenceRecords) {
        if (record.status === 'missed') {
          currentConsecutive++;
          consecutiveMissesMax = Math.max(consecutiveMissesMax, currentConsecutive);
        } else {
          currentConsecutive = 0;
        }
      }
      
      return [missRate, med.total / 100, consecutiveMissesMax / 10]; // Normalize values
    }));
    
    // For demonstration, we'll use a simplified approach
    // In production, we'd use a pre-trained model
    
    // Create some dummy training data
    // Format: [missRate, totalDoses, consecutiveMisses]
    const trainingData = [
      [0.05, 0.5, 0.1], // Low dropout risk
      [0.08, 0.7, 0.1], // Low dropout risk
      [0.15, 0.3, 0.2], // Medium dropout risk
      [0.25, 0.6, 0.3], // Medium dropout risk
      [0.40, 0.2, 0.4], // High dropout risk
      [0.60, 0.4, 0.5], // High dropout risk
    ];
    
    const trainingLabels = [
      0, 0, 1, 1, 2, 2
    ]; // 0: low, 1: medium, 2: high
    
    // Train KNN model
    const knn = new KNN(trainingData, trainingLabels, { k: 3 });
    
    // Make predictions
    const predictions = features.map(feature => {
      return knn.predict([feature])[0];
    });
    
    // Aggregate results
    const riskCounts = [0, 0, 0]; // [low, medium, high]
    predictions.forEach(pred => {
      riskCounts[pred]++;
    });
    
    // Calculate overall risk score (0-1)
    const riskScore = (riskCounts[1] + riskCounts[2] * 2) / (predictions.length * 2);
    
    // Determine confidence
    let confidence = 'medium';
    if (features.length < 3) {
      confidence = 'low';
    } else if (
      (riskCounts[0] > riskCounts[1] + riskCounts[2]) || 
      (riskCounts[2] > riskCounts[0] + riskCounts[1])
    ) {
      confidence = 'high';
    }
    
    return {
      predictionScore: riskScore,
      riskLevel: riskScore < 0.3 ? 'low' : riskScore < 0.7 ? 'medium' : 'high',
      confidence,
      explanation: generateExplanation(riskScore, features)
    };
  } catch (error) {
    logger.error(`Error in dropout prediction: ${error.message}`);
    return {
      predictionScore: 0.5,
      confidence: 'low',
      explanation: 'Error in prediction calculation'
    };
  }
};

// Generate an explanation for the prediction
const generateExplanation = (score, features) => {
  if (score < 0.3) {
    return 'Based on your consistent adherence patterns, you have a low risk of discontinuing your medication.';
  } else if (score < 0.7) {
    return 'Your adherence patterns show some inconsistency. Try to establish a more regular medication routine.';
  } else {
    return 'Your adherence patterns indicate a higher risk of discontinuing medication. Consider setting up additional reminders or speaking with your healthcare provider.';
  }
};