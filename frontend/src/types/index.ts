// types/index.ts (or wherever your types are defined)

import { Session as SupabaseSession } from '@supabase/supabase-js';

export type Session = SupabaseSession;

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  subscription_status?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  subscription_features?: Record<string, any>;
  settings?: UserSettings;
  emergency_contact?: Record<string, any>;
  is_admin?: boolean;

  // Optional fields from your database
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  subscription_expires_at?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  reminder_before: number;
}

export interface UserSettings {
  notification_preferences: NotificationPreferences;
  reminder_settings: {
    default_reminder_time: string;
    reminder_frequency: string;
  };
  theme_preferences: {
    theme: string;
    color_scheme: string;
  };
  timezone: string;
  language?: string;
  preferred_times?: string[];
  email_enabled?: boolean;
}

// For forms and API calls
export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// For profile updates
export interface UserProfileUpdate {
  name?: string;
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  emergency_contact?: Record<string, any>;
}

export interface UserSettingsUpdate {
  email_enabled?: boolean;
  preferred_times?: string[];
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminder_before?: number;
  };
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  frequency: {
    times_per_day: number;
    specific_days: string[];
  };
  scheduled_times: string[];
  instructions?: string;
  start_date: string;
  end_date?: string;
  refill_reminder?: {
    enabled: boolean;
    threshold: number;
    last_refill?: string | null;
    next_refill?: string | null;
    supply_amount: number;
    supply_unit: string;
  } | null;
  side_effects_to_watch: string[];
  active: boolean;
  medication_type?: "prescription" | "otc" | "supplement";
  image_url?: string;
  user_timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface Adherence {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_datetime: string; // ISO string, UTC
  taken_time?: string;
  status: "pending" | "taken" | "skipped" | "missed";
  notes?: string;
  reminder_sent: boolean;
  side_effects_reported?: string[];
  dosage_taken?: {
    amount: number;
    unit: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  medication?: Medication;
  user?: User;
  reminders?: any[];
}

export interface ConfirmDoseDto {
  adherenceId: string;
  takenTime?: string;
  notes?: string;
  side_effects_reported?: string[];
  dosage_taken?: {
    amount: number;
    unit: string;
  };
}

export interface SkipDoseDto {
  adherenceId: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_datetime: string; // ISO string, UTC - matches backend
  status: "pending" | "sent" | "failed";
  channels: {
    email: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
    };
    sms: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
    };
  };
  message?: string;
  retry_count: number;
  last_retry?: string;
  adherence_id?: string;
  created_at: string;
  updated_at: string;
  medication?: Medication; // Include medication data if available
}

export interface AdherenceStats {
  today: {
    taken: number;
    total: number;
    missed: number;
    skipped: number;
    pending: number;
    adherenceRate: number;
  };
  week: {
    taken: number;
    total: number;
    missed: number;
    skipped: number;
    pending: number;
    adherenceRate: number;
  };
  month: {
    taken: number;
    total: number;
    missed: number;
    skipped: number;
    pending: number;
    adherenceRate: number;
  };
  ranking: {
    grade: string;
    color: string;
    text: string;
  };
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface PaginationResult<T> {
  data: T[],
  page: number,
  limit: number,
  total: number
}

// Analytics types
export interface RiskHistory {
  id: string;
  user_id: string;
  medication_id: string;
  risk_score: number;
  factors: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

export interface RiskScore {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  date: string;
}

export interface RiskPrediction {
  id: string;
  user_id: string;
  medication_id: string;
  predicted_risk: number;
  confidence: number;
  date: string;
  factors: string[];
}

export interface LatestRiskScore {
  risk_score: number;
}

// API types for mutations
export interface CreateMedicationData {
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  frequency: {
    times_per_day: number;
    specific_days: string[];
  };
  scheduled_times: string[];
  instructions?: string;
  start_date: string;
  end_date?: string;
  refill_reminder?: {
    enabled: boolean;
    threshold: number;
    days_before: number;
    last_refill?: string | null;
    next_refill?: string | null;
    supply_amount: number;
    supply_unit: string;
  } | null;
  side_effects_to_watch?: string[];
  medication_type?: "prescription" | "otc" | "supplement";
  active?: boolean;
  image_url?: string;
  user_timezone?: string;
}

export interface UpdateMedicationData {
  name?: string;
  dosage?: {
    amount?: number;
    unit?: string;
  };
  frequency?: {
    times_per_day?: number;
    specific_days?: string[];
  };
  scheduled_times?: string[];
  instructions?: string;
  start_date?: string;
  end_date?: string;
  refill_reminder?: {
    enabled?: boolean;
    threshold?: number;
    days_before?: number;
    last_refill?: string | null;
    next_refill?: string | null;
    supply_amount?: number;
    supply_unit?: string;
  } | null;
  side_effects_to_watch?: string[];
  medication_type?: "prescription" | "otc" | "supplement";
  active?: boolean;
  image_url?: string;
}

export interface CreateReminderData {
  medication_id: string;
  scheduled_datetime: string;
  message?: string;
  channels: {
    email: boolean;
    sms: boolean;
  };
}

export interface UpdateReminderSettingsData {
  email_enabled?: boolean;
  sms_enabled?: boolean;
  preferred_times?: string[];
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminder_before?: number;
  };
}