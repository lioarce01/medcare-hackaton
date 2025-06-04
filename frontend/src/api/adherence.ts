import { supabase } from "../config/supabase";

export const adherenceApi = {
  getHistory: async (date?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    let query = supabase
      .from("adherence")
      .select(
        `
        *,
        medication:medications (
          id,
          name,
          dosage,
          instructions
        )
      `
      )
      .eq("user_id", user.id)
      .order("scheduled_time", { ascending: true });

    if (date) {
      query = query.eq("scheduled_date", date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  confirmDose: async (adherenceId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("adherence")
      .update({
        status: "taken",
        taken_time: new Date().toISOString(),
      })
      .eq("id", adherenceId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  skipDose: async (adherenceId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("adherence")
      .update({
        status: "skipped",
      })
      .eq("id", adherenceId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
