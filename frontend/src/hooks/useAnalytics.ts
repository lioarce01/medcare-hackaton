import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";

export const useGetAnalyticsStats = (startDate?: string, endDate?: string) => {
  // Generar la query key según los parámetros para cachear por rango de fechas
  return useQuery({
    queryKey: ["analytics", { startDate, endDate }],
    queryFn: () => analyticsApi.getStats(startDate, endDate),
    enabled: !!startDate || !!endDate, // Para evitar llamada si no hay fechas
  });
};
