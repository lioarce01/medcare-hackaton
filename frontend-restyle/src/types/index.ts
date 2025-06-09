export interface User {
  id: string;
  email: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  subscription_status?: 'active' | 'inactive' | 'trial';
  subscription_plan?: 'free' | 'premium' | 'family';
  subscription_expires_at?: string;
  subscription_features?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
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
    type: 'daily' | 'weekly' | 'as_needed';
    interval: number;
    times_per_day?: number;
  };
  scheduled_times: string[];
  instructions?: string;
  start_date: string;
  end_date?: string;
  refill_reminder?: {
    enabled: boolean;
    days_before: number;
  };
  side_effects_to_watch: string[];
  active: boolean;
  medication_type?: 'prescription' | 'otc' | 'supplement';
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
  status: 'pending' | 'taken' | 'skipped' | 'missed';
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

export interface Reminder {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  scheduled_date: string;
  status: 'pending' | 'sent' | 'failed';
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

export interface UserSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  preferred_times: string[];
  timezone: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reminder_before: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AdherenceStats {
  today: {
    taken: number;
    total: number;
    percentage: number;
  };
  week: {
    taken: number;
    total: number;
    percentage: number;
  };
  month: {
    taken: number;
    total: number;
    percentage: number;
  };
  ranking: 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}