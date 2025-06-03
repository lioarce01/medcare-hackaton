import { supabase } from "../config/supabase";

export const analyticsApi = {
  getStats: async (startDate?: string, endDate?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    let query = supabase
      .from("adherence")
      .select(
        `
        status,
        medication:medications (
          id,
          name
        )
      `
      )
      .eq("user_id", user.id);

    if (startDate) {
      query = query.gte("scheduled_date", startDate);
    }
    if (endDate) {
      query = query.lte("scheduled_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};
