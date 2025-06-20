import { DateTime } from "luxon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdherenceHistory,
  confirmDose,
  skipDose,
  getAdherenceStats,
} from "../api/adherence";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { format, startOfMonth, endOfMonth } from "date-fns";

// Get adherence history
export const useAdherenceHistory = (date?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adherence", "history", date],
    queryFn: () => getAdherenceHistory(date),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get adherence history for a date range
export const useAdherenceHistoryRange = (
  startDate?: string,
  endDate?: string
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adherence", "history", "range", startDate, endDate],
    queryFn: () => getAdherenceHistory(), // Backend should support date range
    enabled: !!user && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      if (!data || !startDate || !endDate) return [];

      return data.filter((item) => {
        const itemDate = item.scheduled_datetime;
        return itemDate >= startDate && itemDate <= endDate;
      });
    },
  });
};

// Get adherence calendar data
export const useAdherenceCalendar = (month?: Date) => {
  const currentMonth = month || new Date();
  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  return useAdherenceHistoryRange(startDate, endDate);
};

// Get adherence statistics
export const useAdherenceStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adherence", "stats"],
    queryFn: getAdherenceStats,
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Confirm dose taken
export const useConfirmDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmDose,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Dose confirmed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm dose");
    },
  });
};

// Skip dose
export const useSkipDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skipDose,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Dose skipped");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to skip dose");
    },
  });
};

// Hook para obtener adherencias de hoy en la zona horaria del usuario
export const useTodayAdherence = () => {
  const { user } = useAuth();
  const userTimezone =
    user?.settings?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useQuery({
    queryKey: ["adherence", "today", userTimezone],
    queryFn: () => getAdherenceHistory(),
    enabled: !!user,
    select: (data) => {
      if (!data) return [];
      const todayLocal = DateTime.now().setZone(userTimezone).toISODate();
      const result = data.filter((item) => {
        // Use scheduled_datetime (UTC ISO string)
        const scheduledUTC = DateTime.fromISO(item.scheduled_datetime, { zone: "utc" });
        const local = scheduledUTC.setZone(userTimezone);
        return local.toISODate() === todayLocal;
      });
      return result;
    },
  });
};
