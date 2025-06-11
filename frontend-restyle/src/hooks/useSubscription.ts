import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  SubscriptionService,
  SubscriptionFeatures,
} from "../services/subscription";

// Main subscription hook
export const useSubscription = () => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  const subscription = useMemo(() => {
    return {
      user,
      isPremium: SubscriptionService.isPremium(user),
      isOnTrial: SubscriptionService.isOnTrial(user),
      isActive: SubscriptionService.isActive(user),
      features: SubscriptionService.getFeatures(user),
      statusText: SubscriptionService.getStatusText(user),
      trialDaysRemaining: SubscriptionService.getTrialDaysRemaining(user),
      isExpiringSoon: SubscriptionService.isExpiringSoon(user),
      plan: user?.subscription_plan || "free",
      status: user?.subscription_status || "inactive",
    };
  }, [user]);

  return subscription;
};

// Hook to check if user has access to a specific feature
export const useFeatureAccess = (feature: keyof SubscriptionFeatures) => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  return useMemo(() => {
    return SubscriptionService.hasFeature(user, feature);
  }, [user, feature]);
};

// Hook to check premium access
export const usePremiumAccess = () => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  return useMemo(() => {
    return SubscriptionService.isPremium(user);
  }, [user]);
};

// Hook to check medication limits
export const useMedicationLimits = (currentCount: number = 0) => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  return useMemo(() => {
    const features = SubscriptionService.getFeatures(user);
    const canAdd = SubscriptionService.canAddMedication(user, currentCount);
    const isUnlimited = features.maxMedications === -1;
    const remaining = isUnlimited
      ? -1
      : Math.max(0, features.maxMedications - currentCount);

    return {
      canAdd,
      isUnlimited,
      maxMedications: features.maxMedications,
      currentCount,
      remaining,
      isAtLimit: !canAdd && !isUnlimited,
    };
  }, [user, currentCount]);
};

// Hook to check reminder limits
export const useReminderLimits = (currentCount: number = 0) => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  return useMemo(() => {
    const features = SubscriptionService.getFeatures(user);
    const canAdd = SubscriptionService.canAddReminder(user, currentCount);
    const isUnlimited = features.maxReminders === -1;
    const remaining = isUnlimited
      ? -1
      : Math.max(0, features.maxReminders - currentCount);

    return {
      canAdd,
      isUnlimited,
      maxReminders: features.maxReminders,
      currentCount,
      remaining,
      isAtLimit: !canAdd && !isUnlimited,
    };
  }, [user, currentCount]);
};

// Hook for trial status
export const useTrialStatus = () => {
  const { user: rawUser } = useAuth();
  const user = rawUser ?? null;

  return useMemo(() => {
    const isOnTrial = SubscriptionService.isOnTrial(user);
    const daysRemaining = SubscriptionService.getTrialDaysRemaining(user);
    const isExpiringSoon = SubscriptionService.isExpiringSoon(user);

    return {
      isOnTrial,
      daysRemaining,
      isExpiringSoon,
      hasExpired: daysRemaining === 0,
    };
  }, [user]);
};
