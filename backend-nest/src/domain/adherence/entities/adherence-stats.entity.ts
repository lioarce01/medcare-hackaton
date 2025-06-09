export interface MedicationStats {
  id: string;
  name: string;
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
}

export interface AdherenceStats {
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  adherenceRate: number;
  byMedication: Record<string, MedicationStats>;
}

export interface AdherenceStatsRaw {
  status: string;
  medication: {
    id: string;
    name: string;
  };
}
