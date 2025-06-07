import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reminder, ReminderSettings } from "../types/reminder";
import apiClient from "./axiosClient";
import logger from "../utils/logger";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/reminders`;

export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (filters: string) => [...reminderKeys.lists(), { filters }] as const,
  details: () => [...reminderKeys.all, "detail"] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
  settings: () => [...reminderKeys.all, "settings"] as const,
};

export const useReminders = () => {
  return useQuery({
    queryKey: reminderKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<Reminder[]>(BASE_URL);
      return data;
    },
  });
};

export const useUpcomingReminders = () => {
  return useQuery({
    queryKey: ["reminders", "upcoming"],
    queryFn: async () => {
      const { data } = await apiClient.get(`${BASE_URL}/upcoming`);
      return data;
    },
  });
};

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: ["reminders", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Reminder>(`${BASE_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      reminder: Omit<Reminder, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const { data } = await apiClient.post<Reminder>(BASE_URL, reminder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
};

export const useSendReminderManually = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`${BASE_URL}/${id}/send`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
};

export const useUpdateReminderSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ReminderSettings) => {
      logger.info("Sending settings update:", settings);
      const { data } = await apiClient.put(`${BASE_URL}/settings`, settings);
      return data as {
        success: boolean;
        message: string;
        data: ReminderSettings;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.settings() });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...reminder
    }: Partial<Reminder> & { id: string }) => {
      const { data } = await apiClient.put<Reminder>(
        `${BASE_URL}/${id}`,
        reminder
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminders", data.id] });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${BASE_URL}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.removeQueries({ queryKey: ["reminders", id] });
    },
  });
};

export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const response = await apiClient.get("/reminders/upcoming");
  return response.data;
};

export const createReminder = async (
  reminder: Omit<Reminder, "id" | "status" | "channels" | "retry_count">
): Promise<Reminder> => {
  const response = await apiClient.post("/reminders", reminder);
  return response.data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  await apiClient.delete(`/reminders/${id}`);
};

export const updateReminder = async (
  id: string,
  reminder: Partial<Reminder>
): Promise<Reminder> => {
  const response = await apiClient.put(`/reminders/${id}`, reminder);
  return response.data;
};

export const useUserSettings = () => {
  return useQuery({
    queryKey: reminderKeys.settings(),
    queryFn: async () => {
      const { data } = await apiClient.get<ReminderSettings>(
        `${BASE_URL}/settings`
      );
      return data;
    },
  });
};
