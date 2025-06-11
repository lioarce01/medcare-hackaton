import apiClient from "../config/api";
import { AdherenceStats } from "../types";

export interface AdherenceTimelineData {
  date: string;
  taken: number;
  total: number;
  percentage: number;
}

export interface RiskPrediction {
  medication_id: string;
  medication_name: string;
  risk_level: "low" | "medium" | "high";
  risk_factors: string[];
  recommendations: string[];
  confidence: number;
}

// Get adherence statistics

// Get adherence timeline data
export const getAdherenceStats = async (
  startDate: string,
  endDate: string
): Promise<AdherenceTimelineData[]> => {
  const response = await apiClient.get("/adherence/stats", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Get risk predictions
export const getRiskPredictions = async (): Promise<RiskPrediction[]> => {
  const response = await apiClient.get("/analytics/risks");
  return response.data;
};
