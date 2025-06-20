import apiClient from "../config/api";
import {
  Adherence,
  AdherenceStats,
  ConfirmDoseDto,
  SkipDoseDto,
} from "../types";

// Get adherence history
export const getAdherenceHistory = async (
  date?: string
): Promise<Adherence[]> => {
  const params = date ? { date } : {};
  const response = await apiClient.get("/adherence/history", { params });
  // NO convertir aquí, solo devolver los datos tal cual
  return response.data;
};

// Confirm dose taken
export const confirmDose = async (data: ConfirmDoseDto): Promise<Adherence> => {
  const response = await apiClient.post("/adherence/confirm", data);
  return response.data;
};

// Skip dose
export const skipDose = async (data: SkipDoseDto): Promise<Adherence> => {
  const response = await apiClient.post("/adherence/skip", data);
  return response.data;
};

// Get adherence statistics
export const getAdherenceStats = async (): Promise<AdherenceStats> => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await apiClient.get("/adherence/stats", { params: { timezone } });
  console.log('Adherence Stats Response:', response.data); // Log para depuración
  return response.data;
};
