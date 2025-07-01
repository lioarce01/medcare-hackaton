import apiClient from "../config/api";
import { Medication, CreateMedicationData, UpdateMedicationData } from "../types";

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
export const getMedications = async (page = 1, limit = 10, searchTerm?: string, filterType?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (filterType) params.append('filterType', filterType);

  const response = await apiClient.get(`/medications?${params.toString()}`);
  console.log('filteredMedications', response.data);
  return response.data;
};

// Get active medications for the current user
export const getActiveMedications = async (page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get(`/medications/active?${params.toString()}`);
  return response.data;
};

// Get medication by ID
export const getMedicationById = async (id: string) => {
  const response = await apiClient.get(`/medications/${id}`);
  return response.data;
};

// Create medication
export const createMedication = async (medicationData: CreateMedicationData) => {
  const response = await apiClient.post('/medications', medicationData);
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
export const updateMedication = async (id: string, medicationData: UpdateMedicationData) => {
  const response = await apiClient.put(`/medications/${id}`, medicationData);
  return response.data;
};

// Delete medication
export const deleteMedication = async (id: string) => {
  const response = await apiClient.delete(`/medications/${id}`);
  return response.data;
};
