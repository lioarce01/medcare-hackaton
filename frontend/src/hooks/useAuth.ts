import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { getUserProfile } from "@/api/users";
import { User } from "@/types";
import { useEffect } from "react";

// Hook principal para obtener la sesión y el usuario
export const useSession = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {

      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['session'], { session: null, user: null });
        queryClient.removeQueries({ queryKey: ['session'] });
      } else if (event === 'SIGNED_IN') {
        // Invalidar y refetch inmediatamente después del signin
        queryClient.invalidateQueries({ queryKey: ['session'] });
      } else if (event === 'TOKEN_REFRESHED') {
        // Solo invalidar si hay cambios significativos
        queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {

        // Obtener sesión de Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        // Si no hay sesión, retornar null
        if (!session) {
          return { session: null, user: null };
        }


        // Si hay sesión, obtener el perfil
        try {
          const profile = await getUserProfile();
          return { session, user: profile };
        } catch (error) {
          console.error('Error fetching user profile:', error);

          // Si es un error de autenticación, limpiar la sesión
          if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            await supabase.auth.signOut();
            return { session: null, user: null };
          }

          // Para otros errores, retornar sesión sin usuario
          return { session, user: null };
        }
      } catch (error) {
        console.error('Session query error:', error);
        return { session: null, user: null };
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutos (más tiempo para evitar refetches innecesarios)
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnMount: false, // Cambiar a false para evitar refetch innecesario
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Evitar refetch en reconexión
    retry: (failureCount, error) => {
      // Solo retry si no es un error de autenticación
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook para iniciar sesión
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // Esperar un poco para que la sesión se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate('/dashboard');
    },
  });
};

// Hook para registrarse
export const useSignUp = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      navigate('/login');
    },
  });
};

// Hook para cerrar sesión
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
};

// Hook para actualizar el perfil del usuario
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const { data: { user } } = await supabase.auth.getUser();
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
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any) => {
      const { data: { user } } = await supabase.auth.getUser();
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