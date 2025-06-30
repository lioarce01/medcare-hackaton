import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMedications,
  getActiveMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../api/medications";
import { CreateMedicationData, UpdateMedicationData } from "../types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Medication, PaginationResult } from "@/types";
import { useAuth } from "./useAuthContext";

// Get all medications
export const useMedications = (page = 1, limit = 10, searchTerm?: string, filterType?: string) => {
  const { user } = useAuth();

  return useQuery<PaginationResult<Medication>>({
    queryKey: ["medications", page, limit, searchTerm, filterType],
    queryFn: () => getMedications(page, limit, searchTerm, filterType),
    placeholderData: (prev) => prev, //keep prev data
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000,
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
export const useActiveMedications = (page = 1, limit = 10) => {
  const { user } = useAuth();

  return useQuery<PaginationResult<Medication>>({
    queryKey: ["medications", "active", page, limit],
    queryFn: () => getActiveMedications(page, limit),
    placeholderData: (prev) => prev, // keep previous data
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get medication by ID
export const useMedicationById = (id: string) => {
  return useQuery<Medication>({
    queryKey: ["medications", id],
    queryFn: () => getMedicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create medication
export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationData: CreateMedicationData) => createMedication(medicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Medication created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create medication");
    },
  });
};

// Update medication
export const useUpdateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, medicationData }: { id: string; medicationData: UpdateMedicationData }) =>
      updateMedication(id, medicationData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["medications", id] });
      toast.success("Medication updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update medication");
    },
  });
};

// Delete medication
export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Medication deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete medication");
    },
  });
};
