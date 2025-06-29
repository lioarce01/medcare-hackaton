import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReminders,
  getUpcomingReminders,
  createReminder,
  sendReminderManually,
  deleteReminder,
  updateReminderSettings,
} from "../api/reminders";
import { toast } from "sonner";
import { getUserSettings } from "@/api/auth";

// Get all reminders
export const useReminders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["reminders", page, limit],
    queryFn: () => getAllReminders(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get upcoming reminders (premium feature)
export const useUpcomingReminders = () => {
  return useQuery({
    queryKey: ["reminders", "upcoming"],
    queryFn: () => getUpcomingReminders(10), // Pass default limit
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get user settings
export const useUserSettings = () => {
  return useQuery({
    queryKey: ["userSettings"],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create reminder (premium feature)
export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminder: any) => createReminder(reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create reminder");
    },
  });
};

// Send reminder manually (premium feature)
export const useSendReminderManually = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendReminderManually,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reminder");
    },
  });
};

// Delete reminder
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete reminder");
    },
  });
};

// Update reminder settings
export const useUpdateReminderSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReminderSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update reminder settings");
    },
  });
};
