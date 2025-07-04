import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdherenceHistory,
  confirmDose,
  skipDose,
  getAdherenceStats,
} from "../api/adherence";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { Adherence, PaginationResult } from "@/types";
import { useAuth } from "./useAuthContext";
import { getUserTimezone, getCurrentDateInUserTimezone } from "@/lib/utils";
import { DateTime } from "luxon";

// Get adherence history
export const useAdherenceHistory = (page?: number, limit?: number, date?: string) => {
  const { user } = useAuth();

  return useQuery<PaginationResult<Adherence>>({
    queryKey: ["adherence", "history", page, limit, date],
    queryFn: () => getAdherenceHistory(page, limit, date),
    placeholderData: (previousData) => previousData, // reemplaza keepPreviousData
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto
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

      return data.data.filter((item) => {
        const itemDate = item.scheduled_datetime;
        return itemDate >= startDate && itemDate <= endDate;
      });
    },
  });
};

// Get adherence calendar data
export const useAdherenceCalendar = (month?: Date) => {
  const currentMonth = month || new Date();

  // Extend the date range to include future data for timeline view
  const extendedStartDate = format(subDays(startOfMonth(currentMonth), 7), "yyyy-MM-dd");
  const extendedEndDate = format(addDays(endOfMonth(currentMonth), 30), "yyyy-MM-dd");

  return useAdherenceHistoryRange(extendedStartDate, extendedEndDate);
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
export const useTodayAdherence = (page?: number, limit?: number) => {
  const { user } = useAuth();
  const userTimezone = getUserTimezone(user?.settings);
  const todayLocal = getCurrentDateInUserTimezone(user?.settings);

  return useQuery({
    queryKey: ["adherence", "today", userTimezone, todayLocal, page, limit],
    queryFn: () => {
      // Convert today's local date to UTC for backend query
      const todayUTC = DateTime.fromISO(todayLocal, { zone: userTimezone }).toUTC().toISODate() || undefined;
      return getAdherenceHistory(page, limit || 100, todayUTC);
    },
    enabled: !!user && !!todayLocal,
    select: (data) => {
      if (!data) return undefined;

      // Filter adherence records that belong to the user's local day
      // This handles edge cases where "today" in user timezone might be "tomorrow" in UTC
      const userTimezone = getUserTimezone(user?.settings);
      const todayLocal = getCurrentDateInUserTimezone(user?.settings);

      const filtered = data.data.filter((item) => {
        // Convert UTC datetime to user's local timezone
        const scheduledUTC = DateTime.fromISO(item.scheduled_datetime, { zone: "utc" });
        const local = scheduledUTC.setZone(userTimezone);
        const itemLocalDate = local.toISODate();

        // Check if this adherence record belongs to today in the user's timezone
        return itemLocalDate === todayLocal;
      });

      return {
        ...data,
        data: filtered,
      };
    }
  });
};