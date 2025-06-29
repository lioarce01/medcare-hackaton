import { Subscription, SubscriptionStatus, SubscriptionPlan, SubscriptionFeatures } from '../entities/subscription.entity';

export class SubscriptionMapper {
  static fromDatabase(data: any): Subscription {
    return new Subscription(
      data.id,
      data.user_id || data.userId,
      data.subscription_status as SubscriptionStatus,
      data.subscription_plan as SubscriptionPlan,
      data.subscription_expires_at ? new Date(data.subscription_expires_at) : null,
      data.subscription_features 
        ? SubscriptionFeatures.fromJson(data.subscription_features)
        : SubscriptionFeatures.createFreeFeatures(),
      data.payment_provider_id || null,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined,
    );
  }

  static toDatabase(subscription: Subscription): any {
    return {
      id: subscription.id,
      user_id: subscription.userId,
      subscription_status: subscription.status,
      subscription_plan: subscription.plan,
      subscription_expires_at: subscription.expiresAt?.toISOString() || null,
      subscription_features: subscription.features.toJson(),
      payment_provider_id: subscription.paymentProviderId,
      created_at: subscription.createdAt?.toISOString(),
      updated_at: subscription.updatedAt?.toISOString(),
    };
  }

  static fromUserData(userData: any): Subscription {
    return new Subscription(
      userData.id,
      userData.id, // user ID is the same as subscription user ID
      userData.subscription_status as SubscriptionStatus || SubscriptionStatus.FREE,
      userData.subscription_plan as SubscriptionPlan || SubscriptionPlan.FREE,
      userData.subscription_expires_at ? new Date(userData.subscription_expires_at) : null,
      userData.subscription_features 
        ? SubscriptionFeatures.fromJson(userData.subscription_features)
        : SubscriptionFeatures.createFreeFeatures(),
      userData.payment_provider_id || null,
      userData.created_at ? new Date(userData.created_at) : undefined,
      userData.updated_at ? new Date(userData.updated_at) : undefined,
    );
  }
}
