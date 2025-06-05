import { supabase } from "../config/supabase";
import { localToUTC, UTCToLocal } from "../utils/formatters";

async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");
  return user;
}

// Get user's timezone
function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Helper function to get next occurrence of a specific day
function getNextOccurrence(targetDay: string, scheduledTime: string): Date {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const targetDayIndex = days.indexOf(targetDay.toLowerCase());
  const currentDayIndex = now.getDay();

  // Parse the scheduled time (in local time)
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const scheduledDate = new Date(now);
  scheduledDate.setHours(hours, minutes, 0, 0);

  // If it's the same day and the time hasn't passed yet, use today
  if (targetDayIndex === currentDayIndex && scheduledDate > now) {
    return scheduledDate;
  }

  // Otherwise, calculate next occurrence
  let daysUntilNext = targetDayIndex - currentDayIndex;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7; // Move to next week
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilNext);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
}

// Helper function to get next occurrence for daily medications
function getNextDailyOccurrence(scheduledTime: string): Date {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const scheduledDate = new Date(now);
  scheduledDate.setHours(hours, minutes, 0, 0);

  // If the time hasn't passed yet today, use today
  if (scheduledDate > now) {
    return scheduledDate;
  }

  // Otherwise, use tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);
  return tomorrow;
}

// Helper function to format date in UTC
function formatUTCDate(date: Date): string {
  return date.toISOString();
}

// Helper function to ensure time is in 24-hour format
function ensure24HourFormat(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

// Convert local time to UTC considering user's timezone
function convertLocalTimeToUTC(
  localTime: string,
  userTimezone: string
): string {
  // Use the imported localToUTC function with the timezone parameter
  return localToUTC(localTime, userTimezone);
}

// Convert UTC time to local time considering user's timezone
function convertUTCToLocalTime(utcTime: string, userTimezone: string): string {
  return UTCToLocal(utcTime, userTimezone);
}

export const medicationApi = {
  getAll: async () => {
    const user = await getUser();
    const userTimezone = getUserTimezone();

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert UTC times back to user's local times
    return data.map((med) => ({
      ...med,
      scheduled_times: med.scheduled_times.map((time: string) =>
        convertUTCToLocalTime(time, userTimezone)
      ),
    }));
  },

  getActive: async () => {
    const user = await getUser();
    const userTimezone = getUserTimezone();

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert UTC times back to user's local times
    return data.map((med) => ({
      ...med,
      scheduled_times: med.scheduled_times.map((time: string) =>
        convertUTCToLocalTime(time, userTimezone)
      ),
    }));
  },

  getById: async (id: string) => {
    const user = await getUser();
    const userTimezone = getUserTimezone();

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    // Convert UTC times back to user's local times
    return {
      ...data,
      scheduled_times: data.scheduled_times.map((time: string) =>
        convertUTCToLocalTime(time, userTimezone)
      ),
    };
  },

  create: async (medication: any) => {
    const user = await getUser();
    const userTimezone = getUserTimezone();
    const now = new Date();

    // Ensure scheduled times are in 24-hour format
    const localScheduledTimes =
      medication.scheduled_times.map(ensure24HourFormat);

    // Convert local times to UTC for storage
    const utcScheduledTimes = localScheduledTimes.map((time: string) =>
      convertLocalTimeToUTC(time, userTimezone)
    );

    // Store in UTC with user's timezone info
    const medicationData = {
      ...medication,
      scheduled_times: utcScheduledTimes, // Store in UTC
      user_timezone: userTimezone, // Store user's timezone
      user_id: user.id,
      start_date: formatUTCDate(now),
      created_at: formatUTCDate(now),
    };

    const { data: medData, error: medError } = await supabase
      .from("medications")
      .insert([medicationData])
      .select()
      .single();

    if (medError) throw medError;

    const adherenceRecords = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If medication has specific days (e.g., "every Thursday")
    if (
      medication.frequency.specific_days &&
      medication.frequency.specific_days.length > 0
    ) {
      // For each specific day, create an adherence record starting from the next occurrence
      for (const day of medication.frequency.specific_days) {
        for (let i = 0; i < localScheduledTimes.length; i++) {
          const localTime = localScheduledTimes[i];
          const utcTime = utcScheduledTimes[i];
          const nextDate = getNextOccurrence(day, localTime);

          // Create adherence record with the properly converted UTC time
          adherenceRecords.push({
            user_id: user.id,
            medication_id: medData.id,
            scheduled_time: utcTime, // This now contains the correct UTC time
            scheduled_date: formatUTCDate(nextDate),
            user_timezone: userTimezone,
            status: "pending",
          });

          // If the next occurrence is today and different from the calculated next date
          const todayOccurrence = new Date(today);
          const [hours, minutes] = localTime.split(":").map(Number);
          todayOccurrence.setHours(hours, minutes, 0, 0);

          if (
            nextDate.toDateString() !== today.toDateString() &&
            todayOccurrence > now &&
            todayOccurrence.getDay() === today.getDay()
          ) {
            adherenceRecords.push({
              user_id: user.id,
              medication_id: medData.id,
              scheduled_time: utcTime,
              scheduled_date: formatUTCDate(today),
              user_timezone: userTimezone,
              status: "pending",
            });
          }
        }
      }
    } else {
      // For daily medications, create records starting from the next occurrence
      for (let i = 0; i < localScheduledTimes.length; i++) {
        const localTime = localScheduledTimes[i];
        const utcTime = utcScheduledTimes[i];
        const nextDate = getNextDailyOccurrence(localTime);

        // Create adherence record with the properly converted UTC time
        adherenceRecords.push({
          user_id: user.id,
          medication_id: medData.id,
          scheduled_time: utcTime, // This now contains the correct UTC time
          scheduled_date: formatUTCDate(nextDate),
          user_timezone: userTimezone,
          status: "pending",
        });

        // If the next occurrence is today, we already created the record above
        // No need for duplicate logic here
      }
    }

    if (adherenceRecords.length > 0) {
      const { error: adhError } = await supabase
        .from("adherence")
        .insert(adherenceRecords);

      if (adhError) throw adhError;
    }

    // Return medication data with local times for consistency
    return {
      ...medData,
      scheduled_times: localScheduledTimes,
    };
  },

  update: async (id: string, medication: any) => {
    const user = await getUser();
    const userTimezone = getUserTimezone();
    const now = new Date();

    // Ensure scheduled times are in 24-hour format
    const localScheduledTimes =
      medication.scheduled_times.map(ensure24HourFormat);

    // Convert local times to UTC for storage
    const utcScheduledTimes = localScheduledTimes.map((time: string) =>
      convertLocalTimeToUTC(time, userTimezone)
    );

    const medicationData = {
      ...medication,
      scheduled_times: utcScheduledTimes, // Store in UTC
      user_timezone: userTimezone, // Update user's timezone
      updated_at: formatUTCDate(now),
    };

    const { data, error } = await supabase
      .from("medications")
      .update(medicationData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Return with local times for consistency
    return {
      ...data,
      scheduled_times: localScheduledTimes,
    };
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
