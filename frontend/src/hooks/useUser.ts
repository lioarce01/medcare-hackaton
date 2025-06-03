import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../api/users";
import { supabase } from "../config/supabase";

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone_number: string;
  };
  preferred_reminder_time?: string[];
  email_notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  // Primero obtener el usuario autenticado
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!authUser) throw new Error("No authenticated user");

  // Luego obtener el perfil completo desde tu tabla de perfiles
  const { data: profile, error: profileError } = await supabase
    .from("users") // o el nombre de tu tabla de perfiles
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError) {
    // Si no existe el perfil, crear uno básico con los datos del auth
    const newProfile: Partial<UserProfile> = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || "",
      allergies: [],
      conditions: [],
      preferred_reminder_time: ["08:00", "12:00", "18:00"],
      email_notifications_enabled: true,
      emergency_contact: {
        name: "",
        relationship: "",
        phone_number: "",
      },
    };

    // Opcional: insertar el perfil básico en la base de datos
    const { data: insertedProfile, error: insertError } = await supabase
      .from("users")
      .insert(newProfile)
      .select()
      .single();

    if (insertError) {
      console.warn("Could not create profile:", insertError);
      return newProfile as UserProfile;
    }

    return insertedProfile;
  }

  return profile;
};

export const useUser = () => {
  return useQuery<UserProfile>({
    queryKey: ["user"],
    queryFn: fetchUserProfile,
    enabled: true,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.refetchQueries({ queryKey: ["user"] });
    },
  });
};
