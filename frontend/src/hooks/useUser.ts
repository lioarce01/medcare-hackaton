import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  deleteUser,
} from "../api/users";
import { toast } from "sonner";
import { useAuth } from "./useAuthContext";

// Get user profile
export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get user profile with session check
export const useUserProfileWithSession = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("No authenticated session");
      }
      return getUserProfile();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

// Update user settings
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], (oldData: any) => ({
        ...oldData,
        settings: data,
      }));
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
};

// Delete user account
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Account deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
};
