import { supabase } from '../config/db.js';

export const createReminder = async (reminderData) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([reminderData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const findRemindersByUser = async (userId, startDate, endDate) => {
  let query = supabase
    .from('reminders')
    .select(`
      *,
      medication:medications (
        name,
        dosage,
        instructions
      )
    `)
    .eq('user_id', userId);
    
  if (startDate) {
    query = query.gte('scheduled_date', startDate);
  }
  if (endDate) {
    query = query.lte('scheduled_date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateReminder = async (id, userId, updates) => {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const findPendingReminders = async (userId, date, startTime, endTime) => {
  let query = supabase
    .from('reminders')
    .select(`
      *,
      medication:medications (
        name,
        dosage,
        instructions
      ),
      user:users (
        email,
        email_notifications_enabled
      )
    `)
    .not('user_id', 'is', null)
    .eq('scheduled_date', date)
    .eq('status', 'pending')
    .gte('scheduled_time', startTime)
    .lte('scheduled_time', endTime);

  // Only filter by user_id if it's provided
  if (userId) {
    query = query.eq('user_id', userId);
  }
    
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export default findPendingReminders;