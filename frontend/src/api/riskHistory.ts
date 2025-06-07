import apiClient from "./axiosClient";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/risk-history`;
export const fetchRiskHistory = async (medicationId: string) => {
  const { data } = await apiClient.get(
    `${BASE_URL}?medication_id=${medicationId}`
  );
  return data;
};
