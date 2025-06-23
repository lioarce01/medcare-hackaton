import { useQuery } from "@tanstack/react-query";
import {
  getRiskHistoryByMedication,
  getRiskHistoryByUser,
  getLatestRiskScore,
  getRiskPredictions,
} from "../api/analytics";
import { getAdherenceTimeline } from "../api/adherence";
import { useAuth } from "./useAuth";
import { DateTime } from "luxon";

// Helper to check if a string is a valid UUID (v4)
function isValidUUID(uuid: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

// Helper to get start/end date for a given time range
export function getDateRangeForTimeRange(timeRange: "7d" | "30d" | "90d") {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const endDate =
    DateTime.now().setZone(timezone).endOf("day").toISODate() || undefined;
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate =
    DateTime.now()
      .setZone(timezone)
      .minus({ days: days - 1 })
      .startOf("day")
      .toISODate() || undefined;
  return { startDate, endDate };
}

// Get risk history for a medication
export const useRiskHistoryByMedication = (
  medicationId: string,
  startDate?: string,
  endDate?: string
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", "risk-history", medicationId, startDate, endDate],
    queryFn: () => getRiskHistoryByMedication(medicationId, startDate, endDate),
    enabled: !!user && !!medicationId && isValidUUID(medicationId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Get all risk history for the current user
export const useRiskHistoryByUser = (
  startDate?: string,
  endDate?: string
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", "risk-history", "user", startDate, endDate],
    queryFn: () => getRiskHistoryByUser(startDate, endDate),
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Get latest risk score for a medication
export const useLatestRiskScore = (medicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", "risk-score", "latest", medicationId],
    queryFn: () => getLatestRiskScore(medicationId),
    enabled: !!user && !!medicationId,
    staleTime: 1 * 60 * 1000,
  });
};

// Get risk predictions
export const useRiskPredictions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", "risks"],
    queryFn: getRiskPredictions,
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 10 minutes
  });
};

// Adherence timeline
export const useAdherenceTimeline = (
  days: number = 30,
  page?: number,
  limit?: number
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["adherence", "timeline", days, page, limit],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);
      return getAdherenceTimeline(startStr, endStr, page, limit);
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000,
  });
};

// Always use this for medication-specific risk history to ensure date range is passed
export const useRiskHistoryByMedicationWithRange = (
  medicationId: string,
  timeRange: "7d" | "30d" | "90d" = "30d"
) => {
  const { startDate, endDate } = getDateRangeForTimeRange(timeRange);
  return useRiskHistoryByMedication(medicationId, startDate, endDate);
};
