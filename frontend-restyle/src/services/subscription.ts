import { User } from "../types";

export type SubscriptionPlan = 'free' | 'premium'
export type SubscriptionStatus = 'free' | 'active'

export interface SubscriptionFeatures {
  // Core features
  medications: boolean;
  basicReminders: boolean;
  adherenceTracking: boolean;

  // Premium features
  advancedAnalytics: boolean;
  exportData: boolean;
  customReminders: boolean;
  unlimitedMedications: boolean;
  riskPredictions: boolean;
  weeklyReports: boolean;

  // Limits
  maxMedications: number;
  maxReminders: number;
  maxFamilyMembers: number;
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    medications: true,
    basicReminders: true,
    adherenceTracking: true,
    advancedAnalytics: false,
    exportData: false,
    customReminders: false,
    unlimitedMedications: false,
    riskPredictions: false,
    weeklyReports: false,
    maxMedications: 3,
    maxReminders: 10,
    maxFamilyMembers: 0,
  },
  premium: {
    medications: true,
    basicReminders: true,
    adherenceTracking: true,
    advancedAnalytics: true,
    exportData: true,
    customReminders: true,
    unlimitedMedications: true,
    riskPredictions: true,
    weeklyReports: true,
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
    return user?.subscription_status === 'active' &&
      (user.subscription_plan === 'premium' || user.subscription_plan === 'family');
  }

  static isActive(user: User | null): boolean {
    return user?.subscription_status === 'active' || user?.subscription_status === 'trial';
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
      case 'active':
        return `${(user.subscription_plan || 'premium').toUpperCase()} Plan`;
      default:
        return 'Free Plan';
    }
  }
}
