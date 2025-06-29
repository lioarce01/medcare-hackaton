import apiClient from "@/config/api";
import { supabase } from "@/config/supabase";
import { User, UserSettings } from "@/types";

export const signUp = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    // Return null if endpoint is not available
    throw error;
  }
};

// Get user settings from database
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data.settings || {
      id: 'default',
      user_id: 'default',
      email_enabled: true,
      preferred_times: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notification_preferences: {
        email: true,
        sms: false,
        push: false,
        reminder_before: 15,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    // Return default settings if endpoint is not available
    return {
      id: 'default',
      user_id: 'default',
      email_enabled: true,
      preferred_times: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notification_preferences: {
        email: true,
        sms: false,
        push: false,
        reminder_before: 15,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
};
