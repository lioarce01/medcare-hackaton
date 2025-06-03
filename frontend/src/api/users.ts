import { supabase } from "../config/supabase";

export const getUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (profile: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase
    .from("users")
    .update(profile)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
