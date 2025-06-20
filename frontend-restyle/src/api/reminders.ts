import apiClient from "../config/api";
import { Reminder, UserSettings } from "../types";

export interface CreateReminderDto {
  medication_id: string;
  scheduled_datetime: string; // ISO string, UTC
  channels?: {
    email: {
      enabled: boolean;
      sent: boolean;
    };
    sms: {
      enabled: boolean;
      sent: boolean;
    };
  };
  message?: string;
  adherence_id?: string;
}

export interface UpdateReminderSettingsDto {
  email_enabled: boolean;
  preferred_times: string[];
  timezone: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reminder_before: number;
  };
}

// Get all reminders
export const getReminders = async (): Promise<Reminder[]> => {
  const response = await apiClient.get("/reminders");
  return response.data;
};

// Get upcoming reminders (premium feature)
export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const response = await apiClient.get("/reminders/upcoming");
  return response.data;
};

// Create reminder (premium feature)
export const createReminder = async (reminder: CreateReminderDto): Promise<Reminder> => {
  const response = await apiClient.post("/reminders", reminder);
  return response.data;
};

// Send reminder manually (premium feature)
export const sendReminderManually = async (id: string): Promise<void> => {
  await apiClient.post(`/reminders/${id}/send`);
};

// Delete reminder
export const deleteReminder = async (id: string): Promise<void> => {
  await apiClient.delete(`/reminders/${id}`);
};

// Update reminder settings
export const updateReminderSettings = async (settings: UpdateReminderSettingsDto): Promise<UserSettings> => {
  const response = await apiClient.put("/reminders/settings", settings);
  return response.data;
};

// Get user settings
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get("/reminders/settings");
  return response.data;
};
