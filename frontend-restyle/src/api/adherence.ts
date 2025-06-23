import apiClient from "../config/api";
import {
  Adherence,
  AdherenceStats,
  ConfirmDoseDto,
  PaginationResult,
  SkipDoseDto,
} from "../types";

// Get adherence history
export const getAdherenceHistory = async (
  page?: number,
  limit?: number,
  date?: string
): Promise<PaginationResult<Adherence>> => {
  const params: any = {}
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (date) params.date = date
  const response = await apiClient.get("/adherence/history", { params });
  console.log('Adherence History Response:', response.data);
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

// Get adherence timeline
export const getAdherenceTimeline = async (
  startDate: string,
  endDate: string,
  page?: number,
  limit?: number
): Promise<PaginationResult<Adherence>> => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const params: any = { startDate, endDate, timezone };
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const response = await apiClient.get("/adherence/timeline", { params });
  console.log('Adherence Timeline Response:', response.data); // Log for debugging
  return response.data;
};
