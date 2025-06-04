import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";

export const useGetAnalyticsStats = (startDate?: string, endDate?: string) => {
  // Generar la query key según los parámetros para cachear por rango de fechas
  return useQuery({
    queryKey: ["analytics", { startDate, endDate }],
    queryFn: () => analyticsApi.getStats(startDate, endDate),
    enabled: true,
  });
};

export function summarizeAnalytics(records: any[]) {
  const total = records.length;
  const taken = records.filter((r) => r.status === "taken").length;
  const missed = records.filter((r) => r.status === "missed").length;
  const skipped = records.filter((r) => r.status === "skipped").length;
  const adherenceRate = total > 0 ? (taken / total) * 100 : 0;
  return {
    overall: {
      total,
      taken,
      missed,
      skipped,
      adherenceRate,
    },
  };
}
