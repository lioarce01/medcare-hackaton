import { Subscription } from '../entities/subscription.entity';

export interface SubscriptionPresentation {
  status: string;
  plan: string;
  expiresAt: string | null;
  features: Record<string, boolean>;
  isActive: boolean;
  isPremium: boolean;
}

export class SubscriptionPresenter {
  static present(subscription: Subscription): SubscriptionPresentation {
    return {
      status: subscription.status,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt?.toISOString() || null,
      features: subscription.features.toJson(),
      isActive: subscription.isActive(),
      isPremium: subscription.isPremium(),
    };
  }

  static presentList(subscriptions: Subscription[]): SubscriptionPresentation[] {
    return subscriptions.map(subscription => this.present(subscription));
  }
}
