import apiClient from "@/config/api";
import { supabase } from "@/config/supabase";
import { UserSettings } from "@/types";

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

// Get user settings from database
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data.settings || {
      email_enabled: true,
      preferred_times: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notification_preferences: {
        email: true,
        sms: false,
        push: false,
        reminder_before: 15,
      },
      reminder_settings: {
        default_reminder_time: '08:00',
        reminder_frequency: 'daily',
      },
      theme_preferences: {
        theme: 'light',
        color_scheme: 'blue',
      },
    };
  } catch (error) {
    // Return default settings if endpoint is not available
    return {
      email_enabled: true,
      preferred_times: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notification_preferences: {
        email: true,
        sms: false,
        push: false,
        reminder_before: 15,
      },
      reminder_settings: {
        default_reminder_time: '08:00',
        reminder_frequency: 'daily',
      },
      theme_preferences: {
        theme: 'light',
        color_scheme: 'blue',
      },
    };
  }
};
