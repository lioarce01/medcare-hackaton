export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  password?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  allergies?: string[] | null;
  conditions?: string[] | null;
  is_admin?: boolean;
  preferred_reminder_time?: string[];
  email_notifications_enabled?: boolean;
  phone_number?: string | null;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone_number: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  subscription_status?: "free" | "premium";
  subscription_plan?: string;
  subscription_expires_at?: string | null;
  subscription_features?: {
    customSounds: boolean;
    smsReminders: boolean;
    familyNotifications: boolean;
    priorityNotifications: boolean;
  };
}
