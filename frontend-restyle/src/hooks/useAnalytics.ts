import { useQuery } from "@tanstack/react-query";
import { getAdherenceStats, getRiskPredictions } from "../api/analytics";
import { useAuth } from "./useAuth";
import { format, subDays } from "date-fns";

// Get adherence timeline data
export const useAdherenceTimeline = (days = 30) => {
  const { user } = useAuth();
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["adherence", "timeline", startDate, endDate],
    queryFn: () => getAdherenceStats(startDate, endDate),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Get risk predictions
export const useRiskPredictions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", "risks"],
    queryFn: getRiskPredictions,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
