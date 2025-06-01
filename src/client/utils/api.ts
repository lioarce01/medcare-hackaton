import axios from 'axios';
import { supabase } from '../../config/supabase';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          await supabase.auth.signOut();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry the original request with the new token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await supabase.auth.signOut();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { data };
  },

  updateProfile: async (profile: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }
};

// Medication API
export const medicationApi = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data };
  },

  getActive: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data };
  },

  getById: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data };
  },

  create: async (medication: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Create the medication
    const { data: medData, error: medError } = await supabase
      .from('medications')
      .insert([{ ...medication, user_id: user.id }])
      .select()
      .single();

    if (medError) throw medError;

    // Create adherence records for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const adherenceRecords = medication.scheduled_times.map((time: string) => ({
      user_id: user.id,
      medication_id: medData.id,
      scheduled_time: time,
      scheduled_date: today.toISOString().split('T')[0],
      status: 'pending'
    }));

    const { error: adhError } = await supabase
      .from('adherence')
      .insert(adherenceRecords);

    if (adhError) throw adhError;

    return { data: medData };
  },

  update: async (id: string, medication: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .update(medication)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  delete: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  }
};

// Adherence API
export const adherenceApi = {
  getHistory: async (date: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('adherence')
      .select(`
        *,
        medication:medications (
          id,
          name,
          dosage,
          instructions
        )
      `)
      .eq('user_id', user.id)
      .eq('scheduled_date', date)
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return { data };
  },

  confirmDose: async (adherenceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('adherence')
      .update({
        status: 'taken',
        taken_time: new Date().toISOString()
      })
      .eq('id', adherenceId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  skipDose: async (adherenceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('adherence')
      .update({
        status: 'skipped'
      })
      .eq('id', adherenceId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }
};

// Analytics API
export const analyticsApi = {
  getStats: async (startDate?: string, endDate?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    let query = supabase
      .from('adherence')
      .select(`
        status,
        medication:medications (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data };
  }
};

// Export the API client for direct use if needed
export default apiClient;