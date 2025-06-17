import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { getUserProfile, getUserSettings, signUp } from "../api/auth";
import { User } from "../types";
import { User as SupabaseUser } from "@supabase/auth-js";

const mapSupabaseUserToLocalUser = (
  authUser: SupabaseUser,
  dbUser?: any,
  settings?: any
): User => {
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name:
      dbUser?.name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      "",
    // Use database values if available, fallback to defaults
    subscription_status: dbUser?.subscription_status || "inactive",
    subscription_plan: dbUser?.subscription_plan || "free",
    subscription_expires_at: dbUser?.subscription_expires_at,
    subscription_features: dbUser?.subscription_features,
    // Additional fields from your database
    date_of_birth: dbUser?.date_of_birth,
    gender: dbUser?.gender,
    allergies: dbUser?.allergies,
    conditions: dbUser?.conditions,
    phone_number: dbUser?.phone_number,
    emergency_contact: dbUser?.emergency_contact,
    is_admin: dbUser?.is_admin || false,
    created_at: authUser.created_at,
    updated_at:
      dbUser?.updated_at || authUser.updated_at || authUser.created_at,
    // Include settings if needed
    settings: settings,
  };
};

const updateUserTimezone = async (userId: string, timezone: string) => {
  const { error } = await supabase
    .from("user_settings")
    .update({ timezone })
    .eq("user_id", userId);

  if (error) {
    console.warn("Error updating user timezone:", error);
  }
};

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
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (user) {
        await updateUserTimezone(user.id, timezone);
      }

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (!data.user) throw new Error("No user returned from supabase");

      return {
        user: data.user,
        session: data.session,
        weakPassword: data.weakPassword,
      };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (data.user) {
        await updateUserTimezone(data.user.id, timezone);
      }

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  // Enhanced user query that fetches from both auth and database
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery<User | null, Error>({
    queryKey: ["user", session?.user?.id] as const,
    queryFn: async () => {
      if (!session?.user) return null;

      try {
        // Get auth user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) return null;

        // Try to get database user profile
        let dbUser = null;
        let settings = null;

        try {
          dbUser = await getUserProfile(authUser.id);
        } catch (error) {
          console.warn("Could not fetch user profile from database:", error);
          // If database user doesn't exist, the trigger should have created it
          // This might happen if the trigger failed during signup
        }

        try {
          settings = await getUserSettings(authUser.id);
        } catch (error) {
          console.warn("Could not fetch user settings from database:", error);
        }

        // Map the combined data
        const mappedUser = mapSupabaseUserToLocalUser(
          authUser,
          dbUser,
          settings
        );
        return mappedUser;
      } catch (error) {
        console.error("Error in user query:", error);
        throw error;
      }
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry if it's a database error (user might not exist yet)
      if (
        error.message?.includes("not found") ||
        error.message?.includes("does not exist")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    user: user as User | null,
    session,
    isAuthenticated: !!session,
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
