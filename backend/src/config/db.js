import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  logger.error('Missing required Supabase environment variables');
  throw new Error('Missing required Supabase environment variables');
}

// Create a Supabase client with the anonymous key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create a Supabase admin client with the service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const connectDB = async () => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabaseAdmin.from('users').select('count');
    if (error) throw error;
    logger.info('Connected to Supabase successfully');
    return true;
  } catch (error) {
    logger.error(`Error connecting to Supabase: ${error.message}`);
    throw error;
  }
};