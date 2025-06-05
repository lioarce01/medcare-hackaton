export interface AdherenceRecord {
  date: string;
  medicationId: string;
  medicationName: string;
  taken: boolean;
  scheduledTime: string;
}

export interface OverallStats {
  totalDoses: number;
  takenDoses: number;
  adherenceRate: number;
  streakDays: number;
}

export interface DayOfWeekStat {
  day: string;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
}

export interface MedicationStat {
  id: string;
  name: string;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
}

export interface WeeklyTrend {
  date: string;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
}

export interface AnalyticsStats {
  overall: OverallStats;
  byDayOfWeek: DayOfWeekStat[];
  byMedication: MedicationStat[];
  weeklyTrend: WeeklyTrend[];
}
