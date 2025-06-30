import apiClient from "../config/api";
import { RiskHistory, RiskScore, RiskPrediction } from "../types";

// Get risk history for a medication
export const getRiskHistoryByMedication = async (medicationId: string, startDate?: string, endDate?: string, page = 1, limit = 10): Promise<RiskHistory[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/risk-history/${medicationId}?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    // Return empty array if endpoint is not available
    return [];
  }
};

// Get all risk history for the current user
export const getRiskHistoryByUser = async (startDate?: string, endDate?: string, page = 1, limit = 10): Promise<RiskHistory[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/risk-history/user?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    // Return empty array if endpoint is not available
    return [];
  }
};

// Get latest risk score for a medication
export const getLatestRiskScore = async (medicationId?: string): Promise<RiskScore> => {
  try {
    if (medicationId) {
      const response = await apiClient.get(`/analytics/risk-score/latest/${medicationId}`);
      return response.data;
    } else {
      // Return default risk score if no medication ID provided
      return {
        score: 0,
        level: 'low',
        factors: [],
        date: new Date().toISOString(),
      };
    }
  } catch (error) {
    // Return default risk score if endpoint is not available
    return {
      score: 0,
      level: 'low',
      factors: [],
      date: new Date().toISOString(),
    };
  }
};

// Get risk predictions
export const getRiskPredictions = async (): Promise<RiskPrediction[]> => {
  try {
    const response = await apiClient.get(`/analytics/risks`);
    return response.data || [];
  } catch (error) {
    // Return empty array if endpoint is not available
    return [];
  }
};
