import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useActiveMedications } from "./useMedications";
import {
  useAdherenceHistory,
  useAdherenceStats,
  useConfirmDose,
  useSkipDose,
} from "./useAdherence";
import { useUpcomingReminders } from "./useReminders";
import { useAuth } from "./useAuth";
import { AdherenceTimelineData } from "@/api/analytics";
import { useAdherenceTimeline } from "./useAnalytics";
import { useMemo } from "react";

// Hook for today's adherence schedule
export const useTodaySchedule = () => {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: adherenceHistory, isLoading: adherenceLoading } =
    useAdherenceHistory(today);
  const { data: medications, isLoading: medicationsLoading } =
    useActiveMedications();

  console.log("adherenceHistory", adherenceHistory);

  const isLoading = adherenceLoading || medicationsLoading;

  const schedule = useMemo(() => {
    if (!user || !adherenceHistory || !medications) return [];

    const normalizeTime = (time: string) => time.slice(0, 5); // HH:mm:ss -> HH:mm

    return medications
      .flatMap((medication) =>
        medication.scheduled_times.map((time) => {
          const adherenceRecord = adherenceHistory.find(
            (adh) =>
              adh.medication_id === medication.id &&
              normalizeTime(adh.scheduled_time) === normalizeTime(time)
          );

          return {
            id: adherenceRecord?.id,
            medication,
            scheduled_time: time,
            scheduled_date: today,
            status: adherenceRecord?.status || "pending",
            taken_time: adherenceRecord?.taken_time,
            notes: adherenceRecord?.notes,
            adherenceId: adherenceRecord?.id,
          };
        })
      )
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  }, [adherenceHistory, medications, today, user]);

  return { data: schedule, isLoading };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const { user } = useAuth();
  const { data: adherenceStats, isLoading: statsLoading } = useAdherenceStats();
  const { data: medications, isLoading: medicationsLoading } =
    useActiveMedications();
  const { data: todaySchedule, isLoading: scheduleLoading } =
    useTodaySchedule();

  const isLoading = statsLoading || medicationsLoading || scheduleLoading;

  const completedToday =
    todaySchedule?.filter((item) => item.status === "taken").length ?? 0;
  const totalToday = todaySchedule?.length ?? 0;
  const pendingToday =
    todaySchedule?.filter((item) => item.status === "pending").length ?? 0;

  const data = {
    today: {
      completed: completedToday,
      total: totalToday,
      adherenceRate:
        totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
      pending: pendingToday,
    },
    week: adherenceStats?.week ?? { taken: 0, total: 0, adherenceRate: 0 },
    month: adherenceStats?.month ?? { taken: 0, total: 0, adherenceRate: 0 },
    activeMedications: medications?.length ?? 0,
    ranking: adherenceStats?.ranking ?? {
      grade: "E",
      color: "orange-600",
      text: "Poor",
    },
  };

  return { data, isLoading };
};

// Hook for dashboard alerts and notifications
export const useDashboardAlerts = () => {
  const { user } = useAuth();
  const { data: medications } = useActiveMedications();
  const { data: upcomingReminders } = useUpcomingReminders();
  const { data: todaySchedule } = useTodaySchedule();
  const { data: timelineData, isLoading: timelineLoading } =
    useAdherenceTimeline(30);

  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => {
      const alerts = [];

      // Refill reminders
      if (medications) {
        medications.forEach((medication) => {
          if (medication.refill_reminder?.enabled) {
            const { last_refill, supply_amount, threshold } =
              medication.refill_reminder;
            const timesPerDay = medication.frequency?.times_per_day ?? 1;

            if (last_refill && supply_amount && timesPerDay) {
              const lastRefillDate = new Date(last_refill);
              const daysOfSupply = Math.floor(supply_amount / timesPerDay);

              const nextRefillDate = new Date(lastRefillDate);
              nextRefillDate.setDate(lastRefillDate.getDate() + daysOfSupply);

              const now = new Date();
              const timeDiff = nextRefillDate.getTime() - now.getTime();
              const daysUntilRefill = Math.ceil(
                timeDiff / (1000 * 60 * 60 * 24)
              );

              if (daysUntilRefill <= threshold) {
                alerts.push({
                  id: `refill-${medication.id}`,
                  type: "refill",
                  priority: "warning",
                  title: "Refill Reminder",
                  message: `${
                    medication.name
                  } refill needed in ${daysUntilRefill} day${
                    daysUntilRefill !== 1 ? "s" : ""
                  }`,
                  medication_id: medication.id,
                });
              }
            }
          }
        });
      }

      // Upcoming doses
      if (todaySchedule) {
        const now = new Date();
        const currentTime = format(now, "HH:mm");

        const nextDose = todaySchedule.find(
          (item) =>
            item.status === "pending" && item.scheduled_time > currentTime
        );

        if (nextDose) {
          alerts.push({
            id: `upcoming-${nextDose.id}`,
            type: "upcoming",
            priority: "info",
            title: "Upcoming Dose",
            message: `${nextDose.medication.name} at ${nextDose.scheduled_time}`,
            medication_id: nextDose.medication.id,
          });
        }
      }

      // Missed doses (dosis perdidas)
      if (todaySchedule) {
        const now = new Date();
        const currentTime = format(now, "HH:mm");

        todaySchedule.forEach((item) => {
          if (item.status === "pending" && item.scheduled_time < currentTime) {
            alerts.push({
              id: `missed-${item.id}`,
              type: "missed",
              priority: "error",
              title: "Missed Dose",
              message: `${item.medication.name} dose scheduled at ${item.scheduled_time} was missed.`,
              medication_id: item.medication.id,
            });
          }
        });
      }

      // Adherence streak (positive alert)
      if (timelineData) {
        const streak = calculateStreakFromTimeline(timelineData);
        if (streak >= 7) {
          alerts.push({
            id: "streak",
            type: "achievement",
            priority: "success",
            title: "Great Progress!",
            message: `${streak}-day streak of perfect adherence`,
          });
        }
      }

      return alerts;
    },
    enabled: !!user && !!medications && !!todaySchedule && !timelineLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for medication actions on dashboard
export const useDashboardActions = () => {
  const confirmDoseMutation = useConfirmDose();
  const skipDoseMutation = useSkipDose();

  const handleMedicationAction = async (
    adherenceId: string,
    action: "take" | "skip",
    notes?: string
  ) => {
    try {
      if (action === "take") {
        await confirmDoseMutation.mutateAsync({
          adherence_id: adherenceId,
          taken_time: String(new Date().toISOString()),
          notes,
        });
      } else {
        await skipDoseMutation.mutateAsync({
          adherence_id: adherenceId,
          notes: notes || "Skipped via dashboard",
        });
      }
    } catch (error) {
      console.error("Failed to update medication status:", error);
      throw error;
    }
  };

  return {
    handleMedicationAction,
    isLoading: confirmDoseMutation.isPending || skipDoseMutation.isPending,
  };
};

function calculateStreakFromTimeline(
  timelineData: AdherenceTimelineData[]
): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const dayData = timelineData.find((d) => d.date === dateStr);
    if (!dayData) break; // Sin datos para este día, termina racha

    if (dayData.percentage < 100) break; // No hubo adherencia perfecta, termina racha

    streak++;
  }

  return streak;
}
