import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// Generate adherence records and reminders for a medication
export const generateAdherenceRecords = async (medicationId, userId) => {
  try {
    // Get medication using Supabase
    const { data: medication, error: medicationError } = await supabase
      .from('medications')
      .select('*')
      .eq('id', medicationId)
      .single();
    
    if (medicationError || !medication) {
      throw new Error('Medication not found');
    }
    
    // Generate records for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    
    // Check if the medication has an end date before our generation period
    if (medication.end_date && new Date(medication.end_date) < today) {
      logger.info(`Skipping adherence generation for expired medication: ${medication.name}`);
      return;
    }
    
    // Adjust end date if medication ends sooner
    if (medication.end_date && new Date(medication.end_date) < endDate) {
      endDate.setTime(new Date(medication.end_date).getTime());
    }
    
    // Generate records for each day
    for (let date = new Date(today); date < endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      // Skip if medication is configured for specific days
      if (medication.frequency?.specific_days?.length > 0 && 
          !medication.frequency.specific_days.includes(dayName)) {
        continue;
      }
      
      // Skip if medication is configured for intervals
      if (medication.frequency?.interval > 1) {
        const startDate = new Date(medication.start_date);
        const diffDays = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
        if (diffDays % medication.frequency.interval !== 0) {
          continue;
        }
      }
      
      // Generate records for each scheduled time
      for (const timeStr of medication.scheduled_times || []) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const scheduledDateTime = new Date(date);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        
        // Skip if the scheduled time is in the past (for today)
        const now = new Date();
        if (date.getDate() === today.getDate() && scheduledDateTime < now) {
          continue;
        }
        
        // Create adherence record
        const { data: adherenceRecord, error: adherenceError } = await supabase
          .from('adherence')
          .insert([{
            user_id: userId,
            medication_id: medicationId,
            scheduled_time: timeStr,
            scheduled_date: date.toISOString().split('T')[0],
            status: 'pending'
          }])
          .select()
          .single();
        
        if (adherenceError) {
          logger.error(`Error creating adherence record: ${adherenceError.message}`);
          continue;
        }
        
        // Create reminder record
        const { error: reminderError } = await supabase
          .from('reminders')
          .insert([{
            user_id: userId,
            medication_id: medicationId,
            scheduled_time: timeStr,
            scheduled_date: date.toISOString().split('T')[0],
            status: 'pending',
            message: `Time to take ${medication.name} - ${medication.dosage?.amount} ${medication.dosage?.unit}`,
            adherence_record_id: adherenceRecord.id
          }]);
        
        if (reminderError) {
          logger.error(`Error creating reminder: ${reminderError.message}`);
        }
        
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
    // 1. Get pending records from previous days
    const { data: pendingRecords, error: pendingError } = await supabase
      .from('adherence')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_date', todayStr);
    
    if (pendingError) throw pendingError;

    // 2. Get pending records from today
    const { data: todayPending, error: todayError } = await supabase
      .from('adherence')
      .select('*')
      .eq('status', 'pending')
      .eq('scheduled_date', todayStr);
    
    if (todayError) throw todayError;

    // 3. Filter today's records that passed the cutoff time
    const skippedToday = (todayPending || []).filter(record => {
      const [h, m] = record.scheduled_time.split(':').map(Number);
      const sched = new Date(record.scheduled_date);
      sched.setHours(h, m, 0, 0);
      return sched < cutoffTime;
    });

    const allSkipped = [...(pendingRecords || []), ...skippedToday];

    // 4. Update status to 'skipped' for all missed records
    if (allSkipped.length > 0) {
      const ids = allSkipped.map(record => record.id);
      const { error: updateError } = await supabase
        .from('adherence')
        .update({ status: 'skipped' })
        .in('id', ids);
      
      if (updateError) throw updateError;
    }

    logger.info(`Processed ${allSkipped.length} skipped adherence records`);
    return allSkipped.length;
  } catch (error) {
    logger.error(`Error processing missed adherence records: ${error.message}`);
    throw error;
  }
};