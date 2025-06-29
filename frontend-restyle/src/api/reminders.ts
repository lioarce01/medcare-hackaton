import apiClient from "../config/api";
import { CreateReminderData, UpdateReminderSettingsData } from "../types";

export interface CreateReminderDto {
  medication_id: string;
  scheduled_datetime: string; // ISO string, UTC
  channels?: {
    email: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
    };
    sms: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
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
export const getAllReminders = async (page = 1, limit = 10, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get(`/reminders?${params.toString()}`);
  return response.data;
};

// Get upcoming reminders
export const getUpcomingReminders = async (limit = 10) => {
  const response = await apiClient.get(`/reminders/upcoming?limit=${limit}`);
  return response.data;
};

// Create reminder
export const createReminder = async (reminderData: CreateReminderData) => {
  const response = await apiClient.post('/reminders', reminderData);
  return response.data;
};

// Send reminder manually
export const sendReminderManually = async (id: string) => {
  const response = await apiClient.post(`/reminders/${id}/send`);
  return response.data;
};

// Delete reminder
export const deleteReminder = async (id: string) => {
  const response = await apiClient.delete(`/reminders/${id}`);
  return response.data;
};

// Get reminder settings
export const getReminderSettings = async () => {
  const response = await apiClient.get('/reminders/settings');
  return response.data;
};

// Update reminder settings
export const updateReminderSettings = async (settings: UpdateReminderSettingsData) => {
  const response = await apiClient.put('/reminders/settings', settings);
  return response.data;
};
