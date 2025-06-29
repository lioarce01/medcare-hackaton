import { User } from "../types";

export type SubscriptionPlan = 'free' | 'premium'
export type SubscriptionStatus = 'free' | 'premium'

export interface SubscriptionFeatures {
  // Core features
  medications: boolean;
  basic_reminders: boolean;
  adherence_tracking: boolean;

  // Premium features
  advanced_analytics: boolean;
  data_export: boolean;
  custom_reminders: boolean;
  unlimited_medications: boolean;
  risk_predictions: boolean;
  weekly_reports: boolean;

  // Limits
  maxMedications: number;
  maxReminders: number;
  maxFamilyMembers: number;
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    medications: true,
    basic_reminders: true,
    adherence_tracking: true,
    advanced_analytics: false,
    data_export: false,
    custom_reminders: false,
    unlimited_medications: false,
    risk_predictions: false,
    weekly_reports: false,
    maxMedications: 3,
    maxReminders: 10,
    maxFamilyMembers: 0,
  },
  premium: {
    medications: true,
    basic_reminders: true,
    adherence_tracking: true,
    advanced_analytics: true,
    data_export: true,
    custom_reminders: true,
    unlimited_medications: true,
    risk_predictions: true,
    weekly_reports: true,
    maxMedications: -1, // unlimited
    maxReminders: -1, // unlimited
    maxFamilyMembers: 0,
  },
};

export class SubscriptionService {
  // Get subscription features from user object (from DB)
  static getFeatures(user: User | null): SubscriptionFeatures {
    if (!user) return SUBSCRIPTION_FEATURES.free;

    return {
      ...SUBSCRIPTION_FEATURES.free, // default fallback
      ...user.subscription_features, // override with actual user features
    };
  }

  static hasFeature(user: User | null, feature: keyof SubscriptionFeatures): boolean {
    const features = this.getFeatures(user);
    return Boolean(features[feature]);
  }

  static isPremium(user: User | null): boolean {
    return user?.subscription_status === 'premium' &&
      (user.subscription_plan === 'premium');
  }

  static isActive(user: User | null): boolean {
    return user?.subscription_status === 'premium'
  }

  static canAddMedication(user: User | null, currentCount: number): boolean {
    const features = this.getFeatures(user);
    return features.maxMedications === -1 || currentCount < features.maxMedications;
  }

  static canAddReminder(user: User | null, currentCount: number): boolean {
    const features = this.getFeatures(user);
    return features.maxReminders === -1 || currentCount < features.maxReminders;
  }

  static getStatusText(user: User | null): string {
    if (!user) return 'Not signed in';

    switch (user.subscription_status) {
      case 'premium':
        return `${(user.subscription_plan || 'premium').toUpperCase()} PLAN`;
      default:
        return 'Free Plan';
    }
  }
}
