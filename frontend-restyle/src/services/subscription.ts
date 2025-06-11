import { User } from "../types";

export type SubscriptionPlan = 'free' | 'premium' | 'family';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled' | 'past_due';

export interface SubscriptionFeatures {
  // Core features
  medications: boolean;
  basicReminders: boolean;
  adherenceTracking: boolean;
  
  // Premium features
  advancedAnalytics: boolean;
  exportData: boolean;
  customReminders: boolean;
  familySharing: boolean;
  prioritySupport: boolean;
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
    familySharing: false,
    prioritySupport: false,
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
    familySharing: false,
    prioritySupport: true,
    unlimitedMedications: true,
    riskPredictions: true,
    weeklyReports: true,
    maxMedications: -1, // unlimited
    maxReminders: -1, // unlimited
    maxFamilyMembers: 0,
  },
  family: {
    medications: true,
    basicReminders: true,
    adherenceTracking: true,
    advancedAnalytics: true,
    exportData: true,
    customReminders: true,
    familySharing: true,
    prioritySupport: true,
    unlimitedMedications: true,
    riskPredictions: true,
    weeklyReports: true,
    maxMedications: -1, // unlimited
    maxReminders: -1, // unlimited
    maxFamilyMembers: 6,
  },
};

export class SubscriptionService {
  // Check if user has access to a specific feature
  static hasFeature(user: User | null, feature: keyof SubscriptionFeatures): boolean {
    if (!user) return false;
    
    const plan = user.subscription_plan || 'free';
    const features = SUBSCRIPTION_FEATURES[plan];
    
    return features[feature] as boolean;
  }

  // Check if user has premium subscription
  static isPremium(user: User | null): boolean {
    if (!user) return false;
    
    return user.subscription_status === 'active' && 
           (user.subscription_plan === 'premium' || user.subscription_plan === 'family');
  }

  // Check if user is on trial
  static isOnTrial(user: User | null): boolean {
    if (!user) return false;
    
    return user.subscription_status === 'trial';
  }

  // Check if subscription is active
  static isActive(user: User | null): boolean {
    if (!user) return false;
    
    return user.subscription_status === 'active' || user.subscription_status === 'trial';
  }

  // Get user's subscription features
  static getFeatures(user: User | null): SubscriptionFeatures {
    if (!user) return SUBSCRIPTION_FEATURES.free;
    
    const plan = user.subscription_plan || 'free';
    return SUBSCRIPTION_FEATURES[plan];
  }

  // Check if user can add more medications
  static canAddMedication(user: User | null, currentCount: number): boolean {
    const features = this.getFeatures(user);
    
    if (features.maxMedications === -1) return true; // unlimited
    
    return currentCount < features.maxMedications;
  }

  // Check if user can add more reminders
  static canAddReminder(user: User | null, currentCount: number): boolean {
    const features = this.getFeatures(user);
    
    if (features.maxReminders === -1) return true; // unlimited
    
    return currentCount < features.maxReminders;
  }

  // Get subscription status display text
  static getStatusText(user: User | null): string {
    if (!user) return 'Not signed in';
    
    switch (user.subscription_status) {
      case 'active':
        return `${user.subscription_plan?.toUpperCase()} Plan`;
      case 'trial':
        return 'Free Trial';
      case 'inactive':
        return 'Free Plan';
      case 'cancelled':
        return 'Cancelled';
      case 'past_due':
        return 'Payment Required';
      default:
        return 'Free Plan';
    }
  }

  // Get days remaining in trial
  static getTrialDaysRemaining(user: User | null): number | null {
    if (!user || !this.isOnTrial(user) || !user.subscription_expires_at) {
      return null;
    }

    const expiryDate = new Date(user.subscription_expires_at);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Check if subscription is expiring soon (within 7 days)
  static isExpiringSoon(user: User | null): boolean {
    const daysRemaining = this.getTrialDaysRemaining(user);
    return daysRemaining !== null && daysRemaining <= 7;
  }
}
