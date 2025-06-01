import { supabase } from '../config/db.js';

export const createAdherenceRecord = async (adherenceData) => {
  const { data, error } = await supabase
    .from('adherence')
    .insert([adherenceData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const findAdherenceById = async (id, userId) => {
  const { data, error } = await supabase
    .from('adherence')
    .select(`
      *,
      medication:medications (
        name,
        dosage,
        instructions
      )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const findAdherenceByDate = async (userId, startDate, endDate = startDate) => {
  const { data, error } = await supabase
    .from('adherence')
    .select(`
      *,
      medication:medications (
        id,
        name,
        dosage,
        instructions,
        image_url
      )
    `)
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);
    
  if (error) throw error;
  return data;
};

export const updateAdherenceRecord = async (id, userId, updates) => {
  const { data, error } = await supabase
    .from('adherence')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteAdherenceRecords = async (medicationId, userId, startDate) => {
  const { error } = await supabase
    .from('adherence')
    .delete()
    .eq('medication_id', medicationId)
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .eq('status', 'pending');
    
  if (error) throw error;
  return true;
};

export const countAdherenceRecords = async (filter) => {
  const { count, error } = await supabase
    .from('adherence')
    .select('*', { count: 'exact', head: true })
    .match(filter);
    
  if (error) throw error;
  return count;
};

export const aggregateAdherenceStats = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('adherence')
    .select(`
      status,
      medication:medications (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);
    
  if (error) throw error;
  
  const stats = {
    total: data.length,
    taken: data.filter(r => r.status === 'taken').length,
    missed: data.filter(r => r.status === 'missed').length,
    skipped: data.filter(r => r.status === 'skipped').length,
    byMedication: {}
  };
  
  data.forEach(record => {
    const medId = record.medication.id;
    if (!stats.byMedication[medId]) {
      stats.byMedication[medId] = {
        name: record.medication.name,
        total: 0,
        taken: 0,
        missed: 0,
        skipped: 0
      };
    }
    
    stats.byMedication[medId].total++;
    stats.byMedication[medId][record.status]++;
  });
  
  return stats;
};

const adherenceModel = {
  createAdherenceRecord,
  findAdherenceById,
  findAdherenceByDate,
  updateAdherenceRecord,
  deleteAdherenceRecords,
  countAdherenceRecords,
  aggregateAdherenceStats
};

export default adherenceModel;