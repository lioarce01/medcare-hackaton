import { supabase } from "../config/supabase";

async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");
  return user;
}

export const medicationApi = {
  getAll: async () => {
    const user = await getUser();
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  getActive: async () => {
    const user = await getUser();
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const user = await getUser();
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (medication: any) => {
    const user = await getUser();

    const { data: medData, error: medError } = await supabase
      .from("medications")
      .insert([{ ...medication, user_id: user.id }])
      .select()
      .single();

    if (medError) throw medError;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const adherenceRecords = medication.scheduled_times.map((time: string) => ({
      user_id: user.id,
      medication_id: medData.id,
      scheduled_time: time,
      scheduled_date: today.toISOString().split("T")[0],
      status: "pending",
    }));

    const { error: adhError } = await supabase
      .from("adherence")
      .insert(adherenceRecords);

    if (adhError) throw adhError;

    return medData;
  },

  update: async (id: string, medication: any) => {
    const user = await getUser();
    const { data, error } = await supabase
      .from("medications")
      .update(medication)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const user = await getUser();
    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  },
};
