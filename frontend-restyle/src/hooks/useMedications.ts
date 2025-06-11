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
import { useMemo } from "react";
import { format } from "date-fns";

// Get all medications
export const useMedications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["medications"],
    queryFn: getMedications,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get medications with filtering and search
export const useMedicationsWithFilters = (
  searchTerm?: string,
  filterType?: string
) => {
  const { data: medications, ...rest } = useMedications();

  const filteredMedications = useMemo(() => {
    if (!medications) return [];

    let filtered = medications;

    // Search filter (protegiendo campos nullable)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (med) =>
          med.name.toLowerCase().includes(search) ||
          (med.instructions?.toLowerCase().includes(search) ?? false) ||
          (med.medication_type?.toLowerCase().includes(search) ?? false)
      );
    }

    // Type filter
    if (filterType && filterType !== "all") {
      filtered = filtered.filter((med) => {
        switch (filterType) {
          case "prescription":
            return med.medication_type === "prescription";
          case "otc":
            return med.medication_type === "otc";
          case "supplement":
            return med.medication_type === "supplement";
          case "active":
            return med.active === true;
          case "inactive":
            return med.active === false;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [medications, searchTerm, filterType]);

  return {
    data: filteredMedications,
    originalData: medications,
    ...rest,
  };
};

// Get active medications
export const useActiveMedications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["medications", "active"],
    queryFn: getActiveMedications,
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
