import { Pill } from "lucide-react";

export interface MedicationFormData {
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  scheduled_times: string[];
  frequency: {
    times_per_day: number;
    specific_days: string[];
  };
  instructions?: string;
  active: boolean;
  medication_type: string;
  image_url?: string;
  start_date: string;
  end_date?: string;
  refill_reminder: {
    enabled: boolean;
    threshold: number;
    last_refill: string | null;
    next_refill: string | null;
    supply_amount: number;
    supply_unit: string;
  };
  side_effects_to_watch: string[];
}

export interface Medication extends MedicationFormData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationCardProps {
  medication: Medication;
  onDelete?: (id: string) => void;
  index: number;
}

export interface MedicationListProps {
  medications: Medication[];
  onDelete?: (id: string) => void;
}

export interface MedicationTypeConfig {
  gradient: string;
  bg: string;
  text: string;
  border: string;
  icon: typeof Pill;
  emoji: string;
}

export type MedicationType =
  | "prescription"
  | "over-the-counter"
  | "vitamin"
  | "supplement";
