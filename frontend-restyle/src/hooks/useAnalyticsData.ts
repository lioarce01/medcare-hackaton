import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAdherenceStats } from "./useAdherence";
import { useAdherenceTimeline, useRiskPredictions } from "./useAnalytics";
import { useActiveMedications } from "./useMedications";
import { useMemo } from "react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export interface AnalyticsData {
  dailyAdherence: any;
  weeklyAdherence: any[];
  monthlyAdherence: any[];
  medicationBreakdown: any[];
  performanceRanking: 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
  streakData: {
    current: number;
    longest: number;
    thisMonth: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

// Hook for analytics overview data
export const useAnalyticsOverview = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const { user } = useAuth();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  const { data: adherenceStats } = useAdherenceStats();
  const { data: timelineData } = useAdherenceTimeline(days);
  const { data: medications } = useActiveMedications();
  const { data: riskPredictions } = useRiskPredictions();

  return useQuery({
    queryKey: ["analytics", "overview", timeRange],
    queryFn: () => {
      if (!adherenceStats || !timelineData || !medications) return null;

      // Generate daily adherence chart data
      const dailyAdherence = {
        labels: timelineData.map(d => format(new Date(d.date), 'MMM d')),
        datasets: [
          {
            label: 'Adherence %',
            data: timelineData.map(d => d.percentage),
            backgroundColor: timelineData.map(d => 
              d.percentage >= 90 ? 'rgba(34, 197, 94, 0.8)' :
              d.percentage >= 70 ? 'rgba(234, 179, 8, 0.8)' :
              d.percentage >= 50 ? 'rgba(249, 115, 22, 0.8)' :
              'rgba(239, 68, 68, 0.8)'
            ),
            borderColor: timelineData.map(d => 
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

      // Generate medication-specific progress
      const medicationBreakdown = medications.map(med => {
        // Calculate adherence rate for this medication from timeline data
        const medTimelineData = timelineData.filter(d => d.date); // In real app, filter by medication
        const adherenceRate = medTimelineData.length > 0 
          ? medTimelineData.reduce((sum, d) => sum + d.percentage, 0) / medTimelineData.length
          : 0;
        
        return {
          medication: med,
          adherenceRate: Math.round(adherenceRate),
          totalDoses: days * (med.frequency.times_per_day || 1),
          takenDoses: Math.round((days * (med.frequency.times_per_day || 1)) * (adherenceRate / 100)),
        };
      });

      // Generate weekly trends
      const weeklyData = [];
      const weeksCount = Math.floor(days / 7);
      for (let i = 0; i < weeksCount; i++) {
        const weekStart = subDays(new Date(), (i + 1) * 7);
        const weekEnd = subDays(new Date(), i * 7);
        
        // Calculate week adherence from timeline data
        const weekTimelineData = timelineData.filter(d => {
          const date = new Date(d.date);
          return date >= weekStart && date <= weekEnd;
        });
        
        const weekAdherence = weekTimelineData.length > 0
          ? weekTimelineData.reduce((sum, d) => sum + d.percentage, 0) / weekTimelineData.length
          : 0;
        
        weeklyData.unshift({
          week: format(weekStart, 'MMM d'),
          adherence: Math.round(weekAdherence),
        });
      }

      // Calculate performance ranking
      const overallAdherence = timelineData.reduce((sum, d) => sum + d.percentage, 0) / timelineData.length;
      const ranking = 
        overallAdherence >= 95 ? 'S' :
        overallAdherence >= 90 ? 'A' :
        overallAdherence >= 80 ? 'B' :
        overallAdherence >= 70 ? 'C' :
        overallAdherence >= 60 ? 'D' : 'E';

      // Calculate streak data
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let thisMonthPerfectDays = 0;
      
      const sortedData = [...timelineData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const today = new Date();
      const thisMonth = today.getMonth();
      
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

      return {
        dailyAdherence,
        weeklyAdherence: weeklyData,
        monthlyAdherence: timelineData,
        medicationBreakdown,
        performanceRanking: ranking as 'S' | 'A' | 'B' | 'C' | 'D' | 'E',
        streakData: {
          current: currentStreak,
          longest: longestStreak,
          thisMonth: thisMonthPerfectDays,
        },
        insights: [], // Will be populated by useAnalyticsInsights
      };
    },
    enabled: !!user && !!adherenceStats && !!timelineData && !!medications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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

      const insights = [];

      // Morning vs Evening analysis
      const morningAdherence = 95; // This would come from time-based analysis
      const eveningAdherence = 80;
      
      if (morningAdherence > eveningAdherence + 10) {
        insights.push({
          type: 'warning' as const,
          title: 'Evening Doses Need Attention',
          description: `Evening medication adherence is ${morningAdherence - eveningAdherence}% lower than morning`,
          icon: 'Clock',
        });
      }

      // Weekly pattern analysis
      if (adherenceStats.week.percentage > 85) {
        insights.push({
          type: 'positive' as const,
          title: 'Excellent Weekly Performance',
          description: `You have a ${adherenceStats.week.percentage}% adherence rate this week`,
          icon: 'TrendingUp',
        });
      }

      // Risk predictions
      if (riskPredictions && riskPredictions.length > 0) {
        const highRiskMeds = riskPredictions.filter(pred => pred.risk_level === 'high');
        if (highRiskMeds.length > 0) {
          insights.push({
            type: 'warning' as const,
            title: 'High Risk Medications Detected',
            description: `${highRiskMeds.length} medication${highRiskMeds.length > 1 ? 's' : ''} need attention`,
            icon: 'AlertTriangle',
          });
        }
      }

      // Consistency analysis
      const recentData = timelineData.slice(-7);
      const consistency = recentData.every(d => d.percentage >= 80);
      if (consistency) {
        insights.push({
          type: 'positive' as const,
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
