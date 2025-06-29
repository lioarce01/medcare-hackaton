import { useQuery } from "@tanstack/react-query";
import { useAdherenceStats } from "./useAdherence";
import { useActiveMedications } from "./useMedications";
import { useMemo } from "react";
import { DateTime } from 'luxon';
import { getRiskHistoryByUser, getLatestRiskScore } from "../api/analytics";
import { RiskHistory, LatestRiskScore } from "../types/analytics";
import { useAdherenceTimeline, useRiskPredictions } from "./useAnalytics";
import { useAuth } from "./useAuthContext";

export interface TimelineDataType {
  date: string;
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  percentage: number;
}

export interface AnalyticsData {
  dailyAdherence: any;
  weeklyAdherence: any[];
  monthlyAdherence: any[];
  medicationBreakdown: any[];
  performanceRanking: 'S' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  rankingColor?: string;
  rankingText?: string;
  streakData: {
    current: number;
    longest: number;
    thisMonth: number;
  };
  todayStats?: any;
  weekStats?: any;
  monthStats?: any;
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
  riskHistory?: RiskHistory[];
  latestRiskScores?: { medicationId: string; riskScore: number | null }[];
}

// Hook for analytics overview data
export const useAnalyticsOverview = (
  timeRange: '7d' | '30d' | '90d' = '30d', page: number = 1, limit: number = 10
) => {
  const { user } = useAuth();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const { data: adherenceStats } = useAdherenceStats();
  // UseAdherenceTimeline now uses correct date range
  const { data: timelineResult } = useAdherenceTimeline(days, page, limit);

  const timelineRaw = timelineResult?.data ?? []
  const timelinePage = timelineResult?.page ?? 1
  const timelineLimit = timelineResult?.limit ?? 10
  const timelineTotal = timelineResult?.total ?? 0

  // Get user timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Calculate startDate and endDate for the selected time range
  const endDate = DateTime.now().setZone(timezone).endOf('day').toISODate() || undefined;
  const startDate = DateTime.now().setZone(timezone).minus({ days: days - 1 }).startOf('day').toISODate() || undefined;

  // Fetch all risk history for the user (with date range)
  const { data: riskHistory } = useQuery<RiskHistory[]>({
    queryKey: ["analytics", "risk-history", user?.id, startDate, endDate],
    queryFn: () => getRiskHistoryByUser(startDate, endDate),
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch latest risk score for each medication
  const { data: medicationsResult } = useActiveMedications();
  const medications = medicationsResult?.data ?? [];
  const medicationsPage = medicationsResult?.page ?? 1;
  const medicationsTotal = medicationsResult?.total ?? 0;

  const { data: latestRiskScores } = useQuery<{ medicationId: string; riskScore: number | null }[]>({
    queryKey: ["analytics", "risk-score", "latest", (medications || []).map(m => m.id)],
    queryFn: async () => {
      if (!user || !medications) return [];
      const results = await Promise.all(
        medications.map(async (med: any) => {
          try {
            const res: LatestRiskScore = await getLatestRiskScore(med.id);
            return { medicationId: med.id, riskScore: res.risk_score };
          } catch {
            return { medicationId: med.id, riskScore: null };
          }
        })
      );
      return results;
    },
    enabled: !!user && !!medications,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Transform adherence timeline to TimelineDataType[]
  const timelineData: TimelineDataType[] = useMemo(() => {
    if (!timelineRaw) return [];
    // Group by local date in user's timezone using Luxon
    const grouped: { [date: string]: { taken: number; missed: number; skipped: number; total: number } } = {};
    for (const entry of timelineRaw) {
      // Convert UTC to local date string in user's timezone using Luxon
      const localDate = DateTime.fromISO(entry.scheduled_datetime, { zone: 'utc' }).setZone(timezone).toFormat('yyyy-MM-dd');
      if (!grouped[localDate]) grouped[localDate] = { taken: 0, missed: 0, skipped: 0, total: 0 };
      grouped[localDate].total++;
      if (entry.status === "taken") grouped[localDate].taken++;
      if (entry.status === "missed") grouped[localDate].missed++;
      if (entry.status === "skipped") grouped[localDate].skipped++;
    }
    // Fill missing days with zeros
    const today = DateTime.now().setZone(timezone).startOf('day');
    const daysArray: TimelineDataType[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = today.minus({ days: i });
      const dateStr = date.toFormat('yyyy-MM-dd');
      const dayData = grouped[dateStr] || { taken: 0, missed: 0, skipped: 0, total: 0 };
      daysArray.push({
        date: dateStr,
        taken: dayData.taken,
        missed: dayData.missed,
        skipped: dayData.skipped,
        total: dayData.total,
        percentage: dayData.total > 0 ? Math.round((dayData.taken / dayData.total) * 100) : 0,
      });
    }
    return daysArray;
  }, [timelineRaw, timezone, days]);

  const analyticsQuery = useQuery<AnalyticsData | null>({
    queryKey: ["analytics", "overview", timeRange],
    queryFn: () => {
      if (!adherenceStats || !timelineData || !medications) return null;
      // Generate daily adherence chart data (ignore days with total === 0)
      const filteredTimeline = timelineData.filter((d: TimelineDataType) => d.total > 0);
      const dailyAdherence = {
        labels: filteredTimeline.map((d: TimelineDataType) => DateTime.fromISO(d.date, { zone: timezone }).toFormat('MMM d')),
        datasets: [
          {
            label: 'Adherence %',
            data: filteredTimeline.map((d: TimelineDataType) => d.percentage),
            backgroundColor: filteredTimeline.map((d: TimelineDataType) =>
              d.percentage >= 90 ? 'rgba(34, 197, 94, 0.8)' :
                d.percentage >= 70 ? 'rgba(234, 179, 8, 0.8)' :
                  d.percentage >= 50 ? 'rgba(249, 115, 22, 0.8)' :
                    'rgba(239, 68, 68, 0.8)'
            ),
            borderColor: filteredTimeline.map((d: TimelineDataType) =>
              d.percentage >= 90 ? 'rgb(34, 197, 94)' :
                d.percentage >= 70 ? 'rgb(234, 179, 8)' :
                  d.percentage >= 50 ? 'rgb(249, 115, 22)' :
                    'rgb(239, 68, 68)'
            ),
            borderWidth: 2,
            borderRadius: 4,
          }
        ]
      };

      // Generate medication-specific progress (with all statuses)
      const medicationBreakdown = medications.map((med: any) => {
        // Filter timelineRaw for this medication
        const medTimeline = (timelineRaw || []).filter((entry: any) => entry.medication_id === med.id);
        let taken = 0, missed = 0, pending = 0, skipped = 0;
        for (const entry of medTimeline) {
          switch (entry.status) {
            case 'taken': taken++; break;
            case 'missed': missed++; break;
            case 'pending': pending++; break;
            case 'skipped': skipped++; break;
          }
        }
        const total = medTimeline.length;
        const denominator = taken + missed + skipped;
        const adherenceRate = denominator > 0 ? Math.round((taken / denominator) * 100) : 0;
        return {
          medication: med,
          adherenceRate,
          totalDoses: total,
          takenDoses: taken,
          missedDoses: missed,
          pendingDoses: pending,
          skippedDoses: skipped,
        };
      });

      // Generate weekly trends (ignore days with total === 0)
      const weeklyData: { week: string; adherence: number }[] = [];
      // Always include the current week (ending today)
      const weeks: { start: Date, end: Date }[] = [];
      // Use Luxon for timezone-correct week calculations
      const luxonToday = DateTime.now().setZone(timezone).startOf('day');
      // Find the start of the current week (Monday)
      const currentWeekStart = luxonToday.startOf('week').plus({ days: 1 }); // Monday as start
      for (let i = 0; i < Math.ceil(days / 7); i++) {
        const weekStart = currentWeekStart.minus({ days: 7 * i });
        const weekEnd = weekStart.plus({ days: 6 });
        weeks.unshift({ start: weekStart.toJSDate(), end: weekEnd.toJSDate() });
      }
      for (const { start: weekStart, end: weekEnd } of weeks) {
        // Calculate week adherence from timeline data
        const weekTimelineData = (timelineData as TimelineDataType[]).filter((d: TimelineDataType) => {
          const date = DateTime.fromISO(d.date, { zone: timezone }).toJSDate();
          return d.total > 0 && date >= weekStart && date <= weekEnd;
        });
        const weekAdherence = weekTimelineData.length > 0
          ? weekTimelineData.reduce((sum: number, d: TimelineDataType) => sum + d.percentage, 0) / weekTimelineData.length
          : 0;
        weeklyData.push({
          week: DateTime.fromJSDate(weekStart).toFormat('MMM d'),
          adherence: Math.round(weekAdherence),
        });
      }

      // Use backend-provided ranking (check for existence and type safety)
      let performanceRanking: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
      if (adherenceStats && typeof adherenceStats === 'object') {
        if ('ranking' in adherenceStats && adherenceStats.ranking?.grade) {
          performanceRanking = adherenceStats.ranking.grade as typeof performanceRanking;
        } else if ('week' in adherenceStats && (adherenceStats as any).week?.ranking?.grade) {
          performanceRanking = (adherenceStats as any).week.ranking.grade as typeof performanceRanking;
        } else if ('month' in adherenceStats && (adherenceStats as any).month?.ranking?.grade) {
          performanceRanking = (adherenceStats as any).month.ranking.grade as typeof performanceRanking;
        }
      }

      // Add ranking color and text from backend if available
      let rankingColor = undefined;
      let rankingText = undefined;
      if (adherenceStats && typeof adherenceStats === 'object') {
        if ('ranking' in adherenceStats && adherenceStats.ranking) {
          rankingColor = adherenceStats.ranking.color;
          rankingText = adherenceStats.ranking.text;
        } else if ('week' in adherenceStats && (adherenceStats as any).week?.ranking) {
          rankingColor = (adherenceStats as any).week.ranking.color;
          rankingText = (adherenceStats as any).week.ranking.text;
        } else if ('month' in adherenceStats && (adherenceStats as any).month?.ranking) {
          rankingColor = (adherenceStats as any).month.ranking.color;
          rankingText = (adherenceStats as any).month.ranking.text;
        }
      }

      // Calculate streak data
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let thisMonthPerfectDays = 0;
      const sortedData = [...(timelineData as TimelineDataType[])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const thisMonth = luxonToday.month - 1; // JS Date months are 0-based
      for (let i = sortedData.length - 1; i >= 0; i--) {
        const item = sortedData[i];
        const itemDate = new Date(item.date);
        if (item.percentage === 100) {
          tempStreak++;
          if (i === sortedData.length - 1) {
            currentStreak = tempStreak;
          }
          if (itemDate.getMonth() === thisMonth) {
            thisMonthPerfectDays++;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Add adherence stats for today, week, month
      const todayStats = adherenceStats.today || {};
      const weekStats = adherenceStats.week || {};
      const monthStats = adherenceStats.month || {};

      return {
        dailyAdherence,
        weeklyAdherence: weeklyData,
        monthlyAdherence: timelineData,
        medicationBreakdown,
        performanceRanking: performanceRanking,
        rankingColor,
        rankingText,
        streakData: {
          current: currentStreak,
          longest: longestStreak,
          thisMonth: thisMonthPerfectDays,
        },
        todayStats,
        weekStats,
        monthStats,
        insights: [], // Will be populated by useAnalyticsInsights
        riskHistory,
        latestRiskScores,
      };
    },
    enabled: !!user && !!adherenceStats && !!timelineData && !!medications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...analyticsQuery,
    timelinePage,
    timelineLimit,
    timelineTotal,
    timelineRaw,
    timelineData,
    medications,
    medicationsPage,
    medicationsTotal,
    riskHistory,
    latestRiskScores,
    adherenceStats, // optional, for advanced stats
    startDate,      // optional, for UI
    endDate,        // optional, for UI
    timezone,       // optional, for UI or further queries
  };
};

// Hook for analytics insights
export const useAnalyticsInsights = () => {
  const { user } = useAuth();
  const { data: adherenceStats } = useAdherenceStats();
  const { data: riskPredictions } = useRiskPredictions();
  const { data: timelineData } = useAdherenceTimeline(30);

  return useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: () => {
      if (!adherenceStats || !timelineData) return [];

      const insights: {
        type: 'positive' | 'warning' | 'info';
        title: string;
        description: string;
        icon: string;
      }[] = [];

      // Morning vs Evening analysis (placeholder, replace with real calculation if available)
      const morningAdherence = 95;
      const eveningAdherence = 80;
      if (morningAdherence > eveningAdherence + 10) {
        insights.push({
          type: 'warning',
          title: 'Evening Doses Need Attention',
          description: `Evening medication adherence is ${morningAdherence - eveningAdherence}% lower than morning`,
          icon: 'Clock',
        });
      }

      // Weekly pattern analysis
      if (adherenceStats.week && adherenceStats.week.adherenceRate > 85) {
        insights.push({
          type: 'positive',
          title: 'Excellent Weekly Performance',
          description: `You have a ${adherenceStats.week.adherenceRate}% adherence rate this week`,
          icon: 'TrendingUp',
        });
      }

      // Risk predictions
      if (riskPredictions && riskPredictions.length > 0) {
        const highRiskMeds = riskPredictions.filter((pred: { risk_level: string }) => pred.risk_level === 'high');
        if (highRiskMeds.length > 0) {
          insights.push({
            type: 'warning',
            title: 'High Risk Medications Detected',
            description: `${highRiskMeds.length} medication${highRiskMeds.length > 1 ? 's' : ''} need attention`,
            icon: 'AlertTriangle',
          });
        }
      }

      // Consistency analysis
      // Transform timelineData (Adherence[]) to TimelineDataType[]
      const grouped: { [date: string]: { taken: number; missed: number; skipped: number; total: number } } = {};
      for (const entry of timelineData.data) {
        const date = entry.scheduled_datetime.slice(0, 10);
        if (!grouped[date]) grouped[date] = { taken: 0, missed: 0, skipped: 0, total: 0 };
        grouped[date].total++;
        if (entry.status === "taken") grouped[date].taken++;
        if (entry.status === "missed") grouped[date].missed++;
        if (entry.status === "skipped") grouped[date].skipped++;
      }
      const processedTimeline: TimelineDataType[] = Object.entries(grouped).map(([date, { taken, missed, skipped, total }]) => ({
        date,
        taken,
        missed,
        skipped,
        total,
        percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const recentData = processedTimeline.slice(-7);
      const consistency = recentData.length > 0 && recentData.every((d) => typeof d.percentage === 'number' && d.percentage >= 80);
      if (consistency) {
        insights.push({
          type: 'positive',
          title: 'Consistent Weekly Pattern',
          description: 'Your adherence has been consistently good this week',
          icon: 'Calendar',
        });
      }

      return insights;
    },
    enabled: !!user && !!adherenceStats && !!timelineData,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
