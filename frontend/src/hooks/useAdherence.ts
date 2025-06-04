import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adherenceApi } from "../api/adherence";

// Hook para obtener el historial de adherence según la fecha
export const useGetAdherenceHistory = (date?: string) => {
  return useQuery({
    queryKey: ["adherence", date || "all"],
    queryFn: () => adherenceApi.getHistory(date),
    enabled: true, // para que no corra si date es vacío
  });
};

// Hook para confirmar que se tomó una dosis
export const useConfirmDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adherenceId: string) => adherenceApi.confirmDose(adherenceId),
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({
        queryKey: ["adherence"],
      });
    },
  });
};

// Hook para saltar una dosis
export const useSkipDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adherenceId: string) => adherenceApi.skipDose(adherenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
    },
  });
};
