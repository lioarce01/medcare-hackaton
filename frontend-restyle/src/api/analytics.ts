import apiClient from "../config/api";

// Get risk history for a medication
export const getRiskHistoryByMedication = async (
  medicationId: string,
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number
) => {
  if (!medicationId || medicationId === 'all' || medicationId === 'user') {
    // Don't call the endpoint if medicationId is not a valid UUID
    return [];
  }
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await apiClient.get(`/analytics/risk-history/${medicationId}`, {
    params,
  });
  console.log("Risk History By Medication Response:", response.data); // Log for debugging
  return response.data;
};

// Get all risk history for the current user
export const getRiskHistoryByUser = async (
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number
) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await apiClient.get(`/analytics/risk-history/user`, {
    params,
  });
  console.log("Risk History By User Response:", response.data); // Log for debugging
  return response.data;
};

// Get latest risk score for a medication
export const getLatestRiskScore = async (medicationId: string) => {
  const response = await apiClient.get(
    `/analytics/risk-score/latest/${medicationId}`
  );
  console.log("Latest Risk Score Response:", response.data); // Log for debugging
  return response.data;
};

// Get risk predictions
export const getRiskPredictions = async () => {
  const response = await apiClient.get(`/analytics/risks`);
  console.log("Risk Predictions Response:", response.data); // Log for debugging
  return response.data;
};
