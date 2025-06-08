import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { reminderKeys } from "../api/reminders";
import type { ReminderSettings } from "../types/reminder";
import { supabase } from "../config/supabase";

export const useReminders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], error } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createReminder = useMutation({
    mutationFn: async (newReminder: any) => {
      const { data, error } = await supabase
        .from("reminders")
        .insert([{ ...newReminder, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      showToast("Recordatorio creado exitosamente", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Error al crear el recordatorio", "error");
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      showToast("Recordatorio eliminado exitosamente", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Error al eliminar el recordatorio", "error");
    },
  });

  const sendReminderManually = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke("send-reminder", {
        body: { reminderId: id },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      showToast("Recordatorio enviado exitosamente", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Error al enviar el recordatorio", "error");
    },
  });

  return {
    reminders,
    error,
    createReminder,
    deleteReminder,
    sendReminderManually,
  };
};

export const useRemindersList = () => {
  const { reminders, error } = useReminders();
  const { showToast } = useToast();

  return {
    reminders,
    error,
    showToast,
  };
};

export const useUpcomingRemindersList = () => {
  const reminders = useUpcomingReminders();
  const { showToast } = useToast();

  return {
    reminders,
    showToast,
  };
};

export const useCreateReminderForm = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { createReminder } = useReminders();

  const handleCreateReminder = (data: {
    medicationId: string;
    scheduledTime: string;
    scheduledDate: string;
    message?: string;
  }) => {
    createReminder.mutate(data, {
      onSuccess: () => {
        showToast("Recordatorio creado exitosamente", "success");
        queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      },
      onError: () => {
        showToast("Error al crear el recordatorio", "error");
      },
    });
  };

  return {
    createReminder: handleCreateReminder,
    isLoading: createReminder.isPending,
  };
};

export const useSendReminder = () => {
  const { showToast } = useToast();
  const { sendReminderManually } = useReminders();

  const handleSendReminder = (reminderId: string) => {
    sendReminderManually.mutate(reminderId, {
      onSuccess: () => {
        showToast("Recordatorio enviado exitosamente", "success");
      },
      onError: () => {
        showToast("Error al enviar el recordatorio", "error");
      },
    });
  };

  return {
    sendReminder: handleSendReminder,
    isLoading: sendReminderManually.isPending,
  };
};

export const useReminderSettings = () => {
  const { showToast } = useToast();
  const { mutate: updateSettings } = useUpdateReminderSettings();

  const handleUpdateSettings = (settings: ReminderSettings) => {
    updateSettings(settings, {
      onSuccess: () => {
        showToast("Configuración actualizada exitosamente", "success");
      },
      onError: () => {
        showToast("Error al actualizar la configuración", "error");
      },
    });
  };

  return {
    updateSettings: handleUpdateSettings,
  };
};

export const useUpcomingReminders = () => {
  const { reminders } = useReminders();
  const now = new Date();

  return reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.scheduled_for);
    return reminderDate > now;
  });
};

export const useUpdateReminderSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ReminderSettings) => {
      const { data, error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user?.id,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      showToast("Configuración actualizada exitosamente", "success");
    },
    onError: (error: any) => {
      showToast(
        error.message || "Error al actualizar la configuración",
        "error"
      );
    },
  });
};
