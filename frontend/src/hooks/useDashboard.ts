import { useQuery } from "@tanstack/react-query";
import { useActiveMedications } from "./useMedications";
import {
  useAdherenceStats,
  useConfirmDose,
  useSkipDose,
  useTodayAdherence,
} from "./useAdherence";
import { useMemo } from "react";
import { DateTime } from "luxon";
import { useAuth } from "./useAuthContext";
import { getUserTimezone } from "@/lib/utils";

// Hook for today's adherence schedule
export const useTodaySchedule = (page = 1, limit = 10) => {
  const { user } = useAuth();
  const {
    data: todayAdherence,
    isLoading: adherenceLoading,
  } = useTodayAdherence(page, limit);
  const {
    data: medications,
    isLoading: medicationsLoading,
  } = useActiveMedications(page, limit);

  const isLoading = adherenceLoading || medicationsLoading;

  const schedule = useMemo(() => {
    if (!user || !todayAdherence || !medications) return [];

    const normalizedMedications = medications.data.map((med) => ({
      ...med,
      refill_reminder:
        med.refill_reminder && !Array.isArray(med.refill_reminder)
          ? med.refill_reminder
          : {
            enabled: false,
            threshold: 7,
            last_refill: null,
            next_refill: null,
            supply_amount: 0,
            supply_unit: "days",
          },
    }));

    const userTimezone = getUserTimezone(user?.settings);

    const mapped = todayAdherence.data
      .map((adh) => {
        const medication = normalizedMedications.find(
          (med) => med.id === adh.medication_id
        );
        const scheduledLocal = DateTime.fromISO(adh.scheduled_datetime, {
          zone: "utc",
        }).setZone(userTimezone);
        return {
          id: adh.id,
          medication,
          scheduled_datetime: adh.scheduled_datetime,
          scheduled_local: scheduledLocal,
          scheduled_local_time: scheduledLocal.toFormat("HH:mm"),
          scheduled_local_date: scheduledLocal.toLocaleString(
            DateTime.DATE_MED
          ),
          status: adh.status,
          taken_time: adh.taken_time,
          notes: adh.notes,
          adherenceId: adh.id,
        };
      })
      .sort((a, b) =>
        a.scheduled_datetime.localeCompare(b.scheduled_datetime)
      );

    return mapped;
  }, [todayAdherence, medications, user]);

  return {
    data: schedule,
    meta: {
      total: todayAdherence?.total || 0,
      page: todayAdherence?.page || page,
      limit: todayAdherence?.limit || limit,
      totalPages: todayAdherence
        ? Math.ceil(todayAdherence.total / todayAdherence.limit)
        : 1,
    },
    isLoading,
  };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
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
    activeMedications: medications?.data.length ?? 0,
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
  const { data: todaySchedule } = useTodaySchedule();

  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => {
      const alerts = [];
      const userTimezone = getUserTimezone(user?.settings);

      // Refill reminders
      if (medications) {
        medications?.data.forEach((medication) => {
          if (medication.refill_reminder?.enabled) {
            const { last_refill, supply_amount, threshold } =
              medication.refill_reminder;
            const timesPerDay = medication.frequency?.times_per_day ?? 1;

            if (last_refill && supply_amount && timesPerDay) {
              const lastRefillDate = DateTime.fromISO(last_refill, { zone: userTimezone });
              const daysOfSupply = Math.floor(supply_amount / timesPerDay);

              const nextRefillDate = lastRefillDate.plus({ days: daysOfSupply });
              const now = DateTime.now().setZone(userTimezone);
              const daysUntilRefill = Math.ceil(nextRefillDate.diff(now, 'days').days);

              if (daysUntilRefill <= threshold) {
                alerts.push({
                  id: `refill-${medication.id}`,
                  type: "refill",
                  priority: "warning",
                  title: "Refill Reminder",
                  message: `${medication.name
                    } refill needed in ${daysUntilRefill} day${daysUntilRefill !== 1 ? "s" : ""
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
        const now = DateTime.now().setZone(userTimezone);

        const nextDose = todaySchedule.find(
          (item) =>
            item.status === "pending" &&
            DateTime.fromISO(item.scheduled_datetime, { zone: "utc" }).setZone(userTimezone) > now
        );

        if (nextDose && nextDose.medication) {
          const localTime = DateTime.fromISO(nextDose.scheduled_datetime, { zone: "utc" }).setZone(userTimezone).toFormat('HH:mm');
          alerts.push({
            id: `upcoming-${nextDose.id}`,
            type: "upcoming",
            priority: "info",
            title: "Upcoming Dose",
            message: `${nextDose.medication.name} at ${localTime}`,
            medication_id: nextDose.medication.id,
          });
        }
      }

      // Missed doses (dosis perdidas)
      if (todaySchedule) {
        const now = DateTime.now().setZone(userTimezone);

        todaySchedule.forEach((item) => {
          const scheduledTime = DateTime.fromISO(item.scheduled_datetime, { zone: "utc" }).setZone(userTimezone);
          if (
            item.status === "pending" &&
            scheduledTime < now &&
            item.medication
          ) {
            const localTime = scheduledTime.toFormat('HH:mm');
            alerts.push({
              id: `missed-${item.id}`,
              type: "missed",
              priority: "error",
              title: "Missed Dose",
              message: `${item.medication.name} dose scheduled at ${localTime} was missed.`,
              medication_id: item.medication.id,
            });
          }
        });
      }

      return alerts;
    },
    enabled: !!user,
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
        const payload: any = {
          adherenceId: adherenceId,
          takenTime: new Date().toISOString(),
        };

        // Only add notes if provided
        if (notes) {
          payload.notes = notes;
        }

        await confirmDoseMutation.mutateAsync(payload);
      } else {
        const payload: any = {
          adherenceId: adherenceId,
        };

        // Only add notes if provided
        if (notes) {
          payload.notes = notes;
        } else {
          payload.notes = "Skipped via dashboard";
        }

        await skipDoseMutation.mutateAsync(payload);
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return {
    handleMedicationAction,
    isLoading: confirmDoseMutation.isPending || skipDoseMutation.isPending,
  };
};

// function calculateStreakFromTimeline(
//   timelineData: AdherenceTimelineData[]
// ): number {
//   let streak = 0;
//   const today = new Date();

//   for (let i = 0; i < 30; i++) {
//     const date = new Date(today);
//     date.setDate(today.getDate() - i);
//     const dateStr = date.toISOString().slice(0, 10);

//     const dayData = timelineData.find((d) => d.date === dateStr);
//     if (!dayData) break; // Sin datos para este día, termina racha

//     if (dayData.percentage < 100) break; // No hubo adherencia perfecta, termina racha

//     streak++;
//   }

//   return streak;
// }
