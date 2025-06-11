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
  const response = await apiClient.get("/adherence/stats");
  return response.data;
};
