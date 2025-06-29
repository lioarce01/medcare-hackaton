import { Injectable } from '@nestjs/common';
import { Subscription, SubscriptionStatus, SubscriptionPlan, SubscriptionFeatures } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionDomainService {
  
  calculateExpirationDate(months: number = 1): Date {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);
    return expiresAt;
  }

  createPremiumSubscription(
    userId: string, 
    paymentProviderId?: string,
    months: number = 1
  ): Subscription {
    const expiresAt = this.calculateExpirationDate(months);
    
    return new Subscription(
      '', // ID will be set by repository
      userId,
      SubscriptionStatus.PREMIUM,
      SubscriptionPlan.PREMIUM,
      expiresAt,
      SubscriptionFeatures.createPremiumFeatures(),
      paymentProviderId,
      new Date(),
      new Date()
    );
  }

  createFreeSubscription(userId: string): Subscription {
    return new Subscription(
      '', // ID will be set by repository
      userId,
      SubscriptionStatus.FREE,
      SubscriptionPlan.FREE,
      null,
      SubscriptionFeatures.createFreeFeatures(),
      null,
      new Date(),
      new Date()
    );
  }

  upgradeToPremium(
    subscription: Subscription, 
    paymentProviderId?: string,
    months: number = 1
  ): void {
    const expirationDate = this.calculateExpirationDate(months);
    subscription.updateToPremium(expirationDate, paymentProviderId);
  }

  downgradeToFree(subscription: Subscription): void {
    subscription.downgradeToFree();
  }

  isSubscriptionExpired(subscription: Subscription): boolean {
    return subscription.isExpired();
  }

  shouldRenewSubscription(subscription: Subscription, daysBeforeExpiry: number = 7): boolean {
    if (!subscription.expiresAt) return false;
    
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + daysBeforeExpiry);
    
    return subscription.expiresAt <= renewalDate;
  }

  validateSubscriptionForFeature(subscription: Subscription, feature: keyof SubscriptionFeatures): boolean {
    return subscription.hasFeature(feature);
  }
}
