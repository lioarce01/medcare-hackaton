import { supabase } from '../config/db.js';

export const createMedication = async (medicationData) => {
  const { data, error } = await supabase
    .from('medications')
    .insert([medicationData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const findMedicationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      adherence (*)
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const findMedicationById = async (id, userId) => {
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      adherence (*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateMedication = async (id, userId, updates) => {
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteMedication = async (id, userId) => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) throw error;
  return true;
};

export const findActiveMedications = async (userId) => {
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      adherence (*)
    `)
    .eq('user_id', userId)
    .eq('active', true)
    .is('end_date', null);
    
  if (error) throw error;
  return data;
};

const medicationModel = {
  createMedication,
  findMedicationsByUser,
  findMedicationById,
  updateMedication,
  deleteMedication,
  findActiveMedications
};

export default medicationModel;