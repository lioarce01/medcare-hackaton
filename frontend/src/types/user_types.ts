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
  email_notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  subscription?: {
    status: "free" | "premium";
    plan: "free" | "premium";
    expiresAt?: string;
    features: {
      smsReminders: boolean;
      customSounds: boolean;
      priorityNotifications: boolean;
      familyNotifications: boolean;
    };
  };
}
