import apiClient from "../config/api";
import { Medication, PaginationResult } from "../types";

export interface CreateMedicationDto {
  user_id: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
    form: string;
  };
  frequency: {
    type: string;
    interval: number;
    times_per_day?: number;
    specific_days?: string[];
  };
  scheduled_times: string[];
  instructions?: string;
  start_date: string;
  end_date?: string;
  refill_reminder?: {
    enabled: boolean;
    days_before?: number;
    threshold: number;
    last_refill?: string | null;
    next_refill?: string | null;
    supply_amount: number;
    supply_unit: string;
  } | null;
  side_effects_to_watch: string[];
  medication_type?: "prescription" | "otc" | "supplement";
}

// Get all medications for the current user
export const getMedications = async (
  page?: number,
  limit?: number,
  searchTerm?: string,
  filterType?: string
): Promise<PaginationResult<Medication>> => {
  try {
    const params: Record<string, string | number> = {}

    // Always include page and limit with defaults if not provided
    params.page = page || 1
    params.limit = limit || 10

    // Only add search and filter params if they have meaningful values
    if (searchTerm && searchTerm.trim() !== '') {
      params.searchTerm = searchTerm.trim()
    }

    if (filterType && filterType !== 'all' && filterType.trim() !== '') {
      params.filterType = filterType.trim()
    }

    const response = await apiClient.get("/medications", { params });
    console.log("Medications Response:", response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching medications:", error);
    throw error; // Re-throw to let the calling component handle it
  }
};

// Get active medications for the current user
export const getActiveMedications = async (
  page?: number,
  limit?: number
): Promise<PaginationResult<Medication>> => {
  const params: any = {}
  if (page) params.page = page
  if (limit) params.limit = limit
  const response = await apiClient.get("/medications/active", { params });
  return response.data;
};

// Get medication by ID
export const getMedicationById = async (id: string): Promise<Medication> => {
  const response = await apiClient.get(`/medications/${id}`);
  return response.data;
};

// Create new medication (with adherence records)
export const createMedication = async (
  medication: CreateMedicationDto
): Promise<Medication> => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const payload = {
    ...medication,
    user_timezone: userTimezone,
  };
  const response = await apiClient.post("/medications", payload);
  return response.data;
};

// Create simple medication (without adherence records)
export const createSimpleMedication = async (
  medication: CreateMedicationDto
): Promise<Medication> => {
  const response = await apiClient.post("/medications/simple", medication);
  return response.data;
};

// Update medication
export const updateMedication = async (
  id: string,
  medication: Partial<CreateMedicationDto>
): Promise<Medication> => {
  const response = await apiClient.put(`/medications/${id}`, medication);
  return response.data;
};

// Delete medication
export const deleteMedication = async (id: string): Promise<void> => {
  await apiClient.delete(`/medications/${id}`);
};
