import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { signIn, signUp, signOut, getUserProfile, getUserSettings } from "../api/auth";
import { User } from "../types";

export const useSignUp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => signUp(name, email, password),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/dashboard");
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const data = await signIn(email, password);
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      navigate("/login");
    },
  });
};

export const useAuth = () => {
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      // Get session from Supabase
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      return supabaseSession;
    },
  });

  // Enhanced user query that fetches from backend
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery<User | null, Error>({
    queryKey: ["user", session?.user?.id] as const,
    queryFn: async () => {
      if (!session?.user) return null;

      try {
        // Get user profile from backend
        const userProfile = await getUserProfile();
        return userProfile;
      } catch (error) {
        // If there's an error, return null
        return null;
      }
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry if it's a database error
      if (
        error.message?.includes("not found") ||
        error.message?.includes("does not exist") ||
        error.message?.includes("404") ||
        error.message?.includes("500")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    user: user as User | null,
    session,
    isAuthenticated: !!session?.user,
    isLoading: sessionLoading || userLoading,
    error: userError,
    isPremium:
      user?.subscription_status === "active" &&
      user?.subscription_plan === "premium",
  };
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("user_settings")
        .update(settings)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
