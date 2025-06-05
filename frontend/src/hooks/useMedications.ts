import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationApi } from "../api/medications";
import { useUser } from "./useUser";

// Constants for cache configuration
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes
const RETRY_ATTEMPTS = 2;

// Get all medications with optimized caching
export const useMedications = () => {
  const { data: user, isPending: isUserLoading } = useUser();

  return useQuery({
    queryKey: ["medications"],
    queryFn: medicationApi.getAll,
    enabled: !!user && !isUserLoading,
    retry: RETRY_ATTEMPTS,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    select: (data) => {
      // Sort medications by active status and creation date
      const sorted = [...data].sort((a, b) => {
        if (a.active !== b.active) return b.active ? 1 : -1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      // Normalize by ID
      const byId = sorted.reduce((acc, med) => {
        acc[med.id] = med;
        return acc;
      }, {} as Record<string, (typeof sorted)[0]>);
      return { byId, all: sorted };
    },
  });
};

// Get active medications with optimized caching
export const useActiveMedications = () => {
  const { data: user, isPending: isUserLoading } = useUser();

  return useQuery({
    queryKey: ["medications", "active"],
    queryFn: medicationApi.getActive,
    enabled: !!user && !isUserLoading,
    retry: RETRY_ATTEMPTS,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

// Get single medication with optimized caching
export const useMedicationById = (id: string) => {
  return useQuery({
    queryKey: ["medications", id],
    queryFn: () => medicationApi.getById(id),
    enabled: !!id,
    retry: RETRY_ATTEMPTS,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

// Create medication with optimistic updates
export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicationApi.create,
    onMutate: async (newMedication) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["medications"] });

      // Snapshot the previous value
      const previousMedications = queryClient.getQueryData(["medications"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["medications"], (old: any[]) => [
        ...(old || []),
        newMedication,
      ]);

      // Return a context object with the snapshotted value
      return { previousMedications };
    },
    onError: (err, newMedication, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMedications) {
        queryClient.setQueryData(["medications"], context.previousMedications);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
};

// Update medication with optimistic updates
export const useUpdateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, medication }: { id: string; medication: any }) =>
      medicationApi.update(id, medication),
    onMutate: async ({ id, medication }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["medications"] });
      await queryClient.cancelQueries({ queryKey: ["medications", id] });

      // Snapshot the previous values
      const previousMedications = queryClient.getQueryData(["medications"]);
      const previousMedication = queryClient.getQueryData(["medications", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["medications"], (old: any[]) =>
        old?.map((med) => (med.id === id ? { ...med, ...medication } : med))
      );
      queryClient.setQueryData(["medications", id], (old: any) => ({
        ...old,
        ...medication,
      }));

      // Return a context object with the snapshotted values
      return { previousMedications, previousMedication };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMedications) {
        queryClient.setQueryData(["medications"], context.previousMedications);
      }
      if (context?.previousMedication) {
        queryClient.setQueryData(
          ["medications", id],
          context.previousMedication
        );
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["medications", id] });
    },
  });
};

// Delete medication with optimistic updates
export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicationApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["medications"] });

      // Snapshot the previous value
      const previousMedications = queryClient.getQueryData(["medications"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["medications"], (old: any[]) =>
        old?.filter((med) => med.id !== id)
      );

      // Return a context object with the snapshotted value
      return { previousMedications };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMedications) {
        queryClient.setQueryData(["medications"], context.previousMedications);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
};
