import Adherence from '../models/adherenceModel.js';
import Medication from '../models/medicationModel.js';
import Reminder from '../models/reminderModel.js';
import { logger } from '../utils/logger.js';

// Generate adherence records and reminders for a medication
export const generateAdherenceRecords = async (medicationId, userId) => {
  try {
    const medication = await Medication.findById(medicationId);
    
    if (!medication) {
      throw new Error('Medication not found');
    }
    
    // Generate records for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7); // 7 days from today
    
    // Check if the medication has an end date before our generation period
    if (medication.endDate && medication.endDate < today) {
      logger.info(`Skipping adherence generation for expired medication: ${medication.name}`);
      return;
    }
    
    // Adjust end date if medication ends sooner
    if (medication.endDate && medication.endDate < endDate) {
      endDate.setTime(medication.endDate.getTime());
    }
    
    // Generate records for each day
    for (let date = new Date(today); date < endDate; date.setDate(date.getDate() + 1)) {
      // Check if this is a day we should generate records for
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      // Skip if medication is configured for specific days and today is not one of them
      if (medication.frequency.specificDays.length > 0 && 
          !medication.frequency.specificDays.includes(dayName)) {
        continue;
      }
      
      // Skip if medication is configured for intervals and today is not a day to take it
      if (medication.frequency.interval > 1) {
        const startDate = new Date(medication.startDate);
        const diffDays = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
        if (diffDays % medication.frequency.interval !== 0) {
          continue;
        }
      }
      
      // Generate records for each scheduled time
      for (const timeStr of medication.scheduledTimes) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const scheduledDateTime = new Date(date);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        
        // Skip if the scheduled time is in the past (for today)
        const now = new Date();
        if (date.getDate() === today.getDate() && scheduledDateTime < now) {
          continue;
        }
        
        // Create adherence record
        const adherenceRecord = await Adherence.create({
          user: userId,
          medication: medicationId,
          scheduledTime: timeStr,
          scheduledDate: new Date(date),
          status: 'pending'
        });
        
        // Create reminder record
        await Reminder.create({
          user: userId,
          medication: medicationId,
          scheduledTime: timeStr,
          scheduledDate: new Date(date),
          status: 'pending',
          message: `Time to take ${medication.name} - ${medication.dosage.amount} ${medication.dosage.unit}`,
          adherenceRecord: adherenceRecord._id
        });
        
        logger.info(`Generated adherence record and reminder for ${medication.name} at ${timeStr} on ${date.toISOString().split('T')[0]}`);
      }
    }
  } catch (error) {
    logger.error(`Error generating adherence records: ${error.message}`);
    throw error;
  }
};

// Process missed adherence records (called by a scheduler)
export const processMissedAdherenceRecords = async () => {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split('T')[0];

  try {
    // 1. Registros pendientes de días anteriores
    const { data: pendingRecords, error: pendingError } = await Adherence.supabase
      .from('adherence')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_date', todayStr);
    if (pendingError) throw pendingError;

    // 2. Registros pendientes de hoy
    const { data: todayPending, error: todayError } = await Adherence.supabase
      .from('adherence')
      .select('*')
      .eq('status', 'pending')
      .eq('scheduled_date', todayStr);
    if (todayError) throw todayError;

    // 3. Filtrar los de hoy que ya pasaron el cutoff
    const missedToday = (todayPending || []).filter(record => {
      const [h, m] = record.scheduled_time.split(':').map(Number);
      const sched = new Date(record.scheduled_date);
      sched.setHours(h, m, 0, 0);
      return sched < cutoffTime;
    });

    const allMissed = [...(pendingRecords || []), ...missedToday];

    // 4. Actualizar estado a 'missed'
    for (const record of allMissed) {
      await Adherence.supabase
        .from('adherence')
        .update({ status: 'missed' })
        .eq('id', record.id);
    }

    logger.info(`Processed ${allMissed.length} missed adherence records`);
    return allMissed.length;
  } catch (error) {
    logger.error(`Error processing missed adherence records: ${error.message}`);
    throw error;
  }
};