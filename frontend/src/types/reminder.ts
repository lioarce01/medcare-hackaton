export interface Reminder {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  scheduled_date: string;
  status: "pending" | "sent" | "failed";
  channels: {
    email: { sent: boolean; enabled: boolean; sentAt?: string };
    sms: { sent: boolean; enabled: boolean; sentAt?: string };
  };
  message?: string;
  retry_count: number;
  last_retry?: string;
  medications?: {
    name: string;
    dosage: string;
    instructions: string;
  };
}

export interface ReminderSettings {
  emailEnabled: boolean;
  preferredTimes: string[];
  timezone: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}
