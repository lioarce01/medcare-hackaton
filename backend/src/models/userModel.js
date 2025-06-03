import { supabase } from '../config/db.js';

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const findUsersByFilter = async (filter) => {
  const { data, error } = await supabase
    .from('users')
    .select()
    .match(filter);
    
  if (error) throw error;
  return data;
};

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};