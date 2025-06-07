import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { signUp } from "../api/auth";
import { UserProfile } from "../types/user_types";

export const useSignUp = () => {
  const navigate = useNavigate();

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
    onSuccess: () => {
      navigate("/dashboard");
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/dashboard");
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useAuth = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile as UserProfile;
    },
    enabled: !!session,
  });

  return {
    user,
    session,
    isAuthenticated: !!session,
    isPremium: user?.subscription_status === "premium",
  };
};
