import apiClient from "../config/api";
import { User, UserSettings } from "../types";

// Get current user profile
export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get("/users/me");
  return response.data;
};

// Update user profile
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  const response = await apiClient.put(`/users/${userData.id}`, userData);
  return response.data;
};

// Update user settings
export const updateUserSettings = async (
  settings: Partial<UserSettings>
): Promise<UserSettings> => {
  const response = await apiClient.patch(`/users/me/settings`, settings);
  return response.data;
};

// Delete user account
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}`);
};
