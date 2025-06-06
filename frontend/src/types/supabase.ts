export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | "prefer not to say" | null;
          allergies: string[] | null;
          conditions: string[] | null;
          is_admin: boolean;
          preferred_reminder_time: string[];
          email_notifications_enabled: boolean;
          phone_number: string | null;
          emergency_contact: any | null;
          created_at: string;
          updated_at: string;
          subscription_status: "free" | "premium";
          subscription_plan: "free" | "premium";
          subscription_expires_at: string | null;
          subscription_features: {
            smsReminders: boolean;
            customSounds: boolean;
            priorityNotifications: boolean;
            familyNotifications: boolean;
          };
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | "prefer not to say" | null;
          allergies?: string[] | null;
          conditions?: string[] | null;
          is_admin?: boolean;
          preferred_reminder_time?: string[];
          email_notifications_enabled?: boolean;
          phone_number?: string | null;
          emergency_contact?: any | null;
          created_at?: string;
          updated_at?: string;
          subscription_status?: "free" | "premium";
          subscription_plan?: "free" | "premium";
          subscription_expires_at?: string | null;
          subscription_features?: {
            smsReminders: boolean;
            customSounds: boolean;
            priorityNotifications: boolean;
            familyNotifications: boolean;
          };
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | "prefer not to say" | null;
          allergies?: string[] | null;
          conditions?: string[] | null;
          is_admin?: boolean;
          preferred_reminder_time?: string[];
          email_notifications_enabled?: boolean;
          phone_number?: string | null;
          emergency_contact?: any | null;
          created_at?: string;
          updated_at?: string;
          subscription_status?: "free" | "premium";
          subscription_plan?: "free" | "premium";
          subscription_expires_at?: string | null;
          subscription_features?: {
            smsReminders: boolean;
            customSounds: boolean;
            priorityNotifications: boolean;
            familyNotifications: boolean;
          };
        };
      };
    };
  };
}
