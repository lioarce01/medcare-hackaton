import { Session, WeakPassword } from "@supabase/supabase-js";

// types/index.ts (or wherever your types are defined)

export interface User {
  id: string;
  email: string;
  name: string;

  // Optional fields from your database
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  emergency_contact?: Record<string, any>;
  is_admin?: boolean;

  // Subscription fields
  subscription_status?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  subscription_features?: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Settings (optional, if you want to include them in the user object)
  settings?: UserSettings;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  preferred_times: string[];
  timezone: string;
  notification_preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
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
  notification_preferences?: Record<string, any>;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
    form: string;
  };
  frequency: {
    type: "daily" | "weekly" | "as_needed";
    interval: number;
    times_per_day?: number;
    specific_days?: string[];
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
  created_at: string;
  updated_at: string;
}

export interface Adherence {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  scheduled_date: string;
  taken_time?: string;
  status: "pending" | "taken" | "skipped" | "missed";
  notes?: string;
  reminder_sent: boolean;
  side_effects_reported?: string[];
  dosage_taken?: {
    amount: number;
    unit: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ConfirmDoseDto {
  adherence_id: string;
  taken_time?: string;
  notes?: string;
  side_effects_reported?: string[];
  dosage_taken?: {
    amount: number;
    unit: string;
  };
}

export interface SkipDoseDto {
  adherence_id: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  scheduled_date: string;
  status: "pending" | "sent" | "failed";
  channels: {
    email: {
      enabled: boolean;
      sent: boolean;
    };
    sms: {
      enabled: boolean;
      sent: boolean;
    };
  };
  message?: string;
  retry_count: number;
  last_retry?: string;
  adherence_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AdherenceStats {
  today: {
    taken: number;
    total: number;
    adherenceRate: number;
  };
  week: {
    taken: number;
    total: number;
    adherenceRate: number;
  };
  month: {
    taken: number;
    total: number;
    adherenceRate: number;
  };
  ranking: {
    grade: string;
    color: string;
    text: string;
  };
}

export interface AuthContextType {
  // Estado del usuario
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isPremium: boolean;

  // Manejo de errores
  authError: string | null;
  clearError: () => void;

  // Funciones de autenticación
  login: (email: string, password: string, redirectTo?: string) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    redirectTo?: string
  ) => Promise<any>;
  logout: (redirectTo?: string) => Promise<void>;
  refreshSession: () => Promise<any>;

  // Estados específicos de las operaciones
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
}
