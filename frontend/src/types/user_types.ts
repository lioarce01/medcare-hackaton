export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  allergies?: string[];
  conditions?: string[];
  phone_number?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone_number: string;
  };
  preferred_reminder_time?: string[];
  created_at?: string;
  updated_at?: string;
  subscription_status?: "free" | "premium";
  subscription_plan?: "free" | "premium";
  subscription_expires_at?: string;
  subscription_features?: {
    smsReminders: boolean;
    customSounds: boolean;
    priorityNotifications: boolean;
    familyNotifications: boolean;
  };
}
