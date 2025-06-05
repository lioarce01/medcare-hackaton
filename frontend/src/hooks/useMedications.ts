import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationApi } from "../api/medications";
import { useUser } from "./useUser";

// Obtener todas las medicaciones
export const useMedications = () => {
  const { data: user, isPending: isUserLoading } = useUser();

  return useQuery({
    queryKey: ["medications"],
    queryFn: medicationApi.getAll,
    enabled: !!user && !isUserLoading,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Obtener medicaciones activas
export const useActiveMedications = () => {
  const { data: user, isPending: isUserLoading } = useUser();

  return useQuery({
    queryKey: ["medications", "active"],
    queryFn: medicationApi.getActive,
    enabled: !!user && !isUserLoading,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useMedicationById = (id: string) => {
  return useQuery({
    queryKey: ["medications", id],
    queryFn: () => medicationApi.getById(id),
    enabled: !!id,
  });
};

// Crear medicación
export const useCreateMedication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
};

export const useUpdateMedication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, medication }: { id: string; medication: any }) =>
      medicationApi.update(id, medication),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
};

export const useDeleteMedication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
};
