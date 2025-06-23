import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMedications,
  getActiveMedications,
  getMedicationById,
  createMedication,
  createSimpleMedication,
  updateMedication,
  deleteMedication,
  CreateMedicationDto,
} from "../api/medications";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useEffect, useMemo, useState } from "react";
import { Medication, PaginationResult } from "@/types";

// Get all medications
export const useMedications = (page?: number, limit?: number) => {
  const { user } = useAuth();

  return useQuery<PaginationResult<Medication>>({
    queryKey: ["medications", page, limit],
    queryFn: () => getMedications(page, limit),
    placeholderData: (prev) => prev, //keep prev data
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMedicationsWithFilters = (
  searchTerm?: string,
  filterType?: string,
  page = 1,
  limit = 10,
  debounceMs = 500
) => {
  const { user } = useAuth();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useQuery<PaginationResult<Medication>>({
    queryKey: ["medications", page, limit, debouncedSearchTerm, filterType],
    queryFn: () => getMedications(page, limit, debouncedSearchTerm, filterType),
    placeholderData: (prev) => prev,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMedicationsList = (
  searchTerm?: string,
  filterType?: string,
  page = 1,
  limit = 10
) => {
  const queryResult = useMedicationsWithFilters(searchTerm, filterType, page, limit);

  return {
    medications: queryResult.data?.data || [],
    pagination: {
      page: queryResult.data?.page || page,
      limit: queryResult.data?.limit || limit,
      total: queryResult.data?.total || 0,
      totalPages: Math.ceil((queryResult.data?.total || 0) / limit),
    },
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

// Get active medications
export const useActiveMedications = (page?: number, limit?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["medications", "active", page, limit],
    queryFn: () => getActiveMedications(page, limit),
    placeholderData: (prev) => prev, // keep previous data
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get medication by ID
export const useMedication = (id: string) => {
  return useQuery({
    queryKey: ["medications", id],
    queryFn: () => getMedicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create medication with adherence records
export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["medications"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["adherence"],
          exact: false,
        }),
      ]);

      toast.success("Medication created successfully");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create medication"
      );
    },
  });
};

// Create simple medication without adherence records
export const useCreateSimpleMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSimpleMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Medication created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create medication"
      );
    },
  });
};

// Update medication
export const useUpdateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      medication,
    }: {
      id: string;
      medication: Partial<CreateMedicationDto>;
    }) => updateMedication(id, medication),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["medications", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      toast.success("Medication updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update medication"
      );
    },
  });
};

// Delete medication
export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["medications"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["adherence"],
          exact: false,
        }),
      ]);

      toast.success("Medication created successfully");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete medication"
      );
    },
  });
};
