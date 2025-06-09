import { User, Medication, Adherence, Reminder, UserSettings, AdherenceStats } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    name: 'John Doe',
    date_of_birth: '1985-06-15',
    gender: 'male',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    phone_number: '+1234567890',
    emergency_contact: {
      name: 'Jane Doe',
      phone: '+1234567891',
      relationship: 'Spouse'
    },
    subscription_status: 'active',
    subscription_plan: 'premium',
    subscription_expires_at: '2024-12-31',
    subscription_features: {
      analytics: true,
      export: true,
      reminders: true,
      family_sharing: true
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    user_id: 'user-1',
    name: 'Lisinopril',
    dosage: {
      amount: 10,
      unit: 'mg',
      form: 'tablet'
    },
    frequency: {
      type: 'daily',
      interval: 1,
      times_per_day: 1
    },
    scheduled_times: ['08:00'],
    instructions: 'Take with water, preferably in the morning',
    start_date: '2024-01-01T00:00:00Z',
    refill_reminder: {
      enabled: true,
      days_before: 7
    },
    side_effects_to_watch: ['Dizziness', 'Dry cough', 'Fatigue'],
    active: true,
    medication_type: 'prescription',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'med-2',
    user_id: 'user-1',
    name: 'Metformin',
    dosage: {
      amount: 500,
      unit: 'mg',
      form: 'tablet'
    },
    frequency: {
      type: 'daily',
      interval: 1,
      times_per_day: 2
    },
    scheduled_times: ['08:00', '20:00'],
    instructions: 'Take with meals to reduce stomach upset',
    start_date: '2024-01-01T00:00:00Z',
    refill_reminder: {
      enabled: true,
      days_before: 5
    },
    side_effects_to_watch: ['Nausea', 'Diarrhea', 'Stomach upset'],
    active: true,
    medication_type: 'prescription',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'med-3',
    user_id: 'user-1',
    name: 'Vitamin D3',
    dosage: {
      amount: 2000,
      unit: 'IU',
      form: 'capsule'
    },
    frequency: {
      type: 'daily',
      interval: 1,
      times_per_day: 1
    },
    scheduled_times: ['09:00'],
    instructions: 'Take with food for better absorption',
    start_date: '2024-01-01T00:00:00Z',
    refill_reminder: {
      enabled: false,
      days_before: 0
    },
    side_effects_to_watch: [],
    active: true,
    medication_type: 'supplement',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAdherence: Adherence[] = [
  {
    id: 'adh-1',
    user_id: 'user-1',
    medication_id: 'med-1',
    scheduled_time: '08:00',
    scheduled_date: '2024-01-15',
    taken_time: '2024-01-15T08:05:00Z',
    status: 'taken',
    reminder_sent: true,
    created_at: '2024-01-15T08:05:00Z',
    updated_at: '2024-01-15T08:05:00Z'
  },
  {
    id: 'adh-2',
    user_id: 'user-1',
    medication_id: 'med-2',
    scheduled_time: '08:00',
    scheduled_date: '2024-01-15',
    taken_time: '2024-01-15T08:10:00Z',
    status: 'taken',
    reminder_sent: true,
    created_at: '2024-01-15T08:10:00Z',
    updated_at: '2024-01-15T08:10:00Z'
  },
  {
    id: 'adh-3',
    user_id: 'user-1',
    medication_id: 'med-2',
    scheduled_time: '20:00',
    scheduled_date: '2024-01-15',
    status: 'pending',
    reminder_sent: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export const mockReminders: Reminder[] = [
  {
    id: 'rem-1',
    user_id: 'user-1',
    medication_id: 'med-1',
    scheduled_time: '08:00',
    scheduled_date: '2024-01-16',
    status: 'pending',
    channels: {
      email: {
        enabled: true,
        sent: false
      },
      sms: {
        enabled: false,
        sent: false
      }
    },
    message: 'Time to take your Lisinopril (10mg)',
    retry_count: 0,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export const mockUserSettings: UserSettings = {
  id: 'settings-1',
  user_id: 'user-1',
  email_enabled: true,
  preferred_times: ['08:00', '12:00', '18:00', '21:00'],
  timezone: 'America/New_York',
  notification_preferences: {
    email: true,
    sms: false,
    push: true,
    reminder_before: 15
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockAdherenceStats: AdherenceStats = {
  today: {
    taken: 2,
    total: 4,
    percentage: 50
  },
  week: {
    taken: 18,
    total: 21,
    percentage: 86
  },
  month: {
    taken: 82,
    total: 93,
    percentage: 88
  },
  ranking: 'A'
};

// Generate more adherence data for charts
export const generateAdherenceData = (days: number = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const totalMeds = 4; // 4 doses per day
    const takenMeds = Math.floor(Math.random() * totalMeds) + 1;
    
    data.push({
      date: date.toISOString().split('T')[0],
      taken: takenMeds,
      total: totalMeds,
      percentage: Math.round((takenMeds / totalMeds) * 100)
    });
  }
  
  return data;
};