import { Subscription } from '../entities/subscription.entity';

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>;
  updateSubscriptionStatus(
    userId: string, 
    status: string, 
    plan: string, 
    expiresAt: Date | null, 
    features: Record<string, boolean>,
    paymentProviderId?: string
  ): Promise<void>;
  create(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
}
