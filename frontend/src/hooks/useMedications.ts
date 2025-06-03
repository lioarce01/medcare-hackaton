import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationApi } from "../api/medications";

// Obtener todas las medicaciones
export const useMedications = () => {
  return useQuery({
    queryKey: ["medications"],
    queryFn: medicationApi.getAll,
  });
};

// Obtener medicaciones activas
export const useActiveMedications = () => {
  return useQuery({
    queryKey: ["medications", "active"],
    queryFn: medicationApi.getActive,
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
