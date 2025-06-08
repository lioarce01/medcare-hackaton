import { useQuery } from "@tanstack/react-query";
import { fetchRiskHistory } from "../api/riskHistory";

export const useRiskHistory = (medicationId: string) => {
  return useQuery({
    queryKey: ["riskHistory", medicationId],
    queryFn: () => fetchRiskHistory(medicationId),
    enabled: !!medicationId, // para no ejecutar si no hay medicationId
  });
};
