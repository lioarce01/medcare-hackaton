import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionRepository } from '../../../domain/subscription/repositories/subscription.repository';
import { Subscription } from '../../../domain/subscription/entities/subscription.entity';
import { SubscriptionMapper } from '../../../domain/subscription/mappers/subscription.mapper';

@Injectable()
export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Subscription | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          subscription_status: true,
          subscription_plan: true,
          subscription_expires_at: true,
          subscription_features: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        return null;
      }

      return SubscriptionMapper.fromUserData(user);
    } catch (error) {
      console.error('Error finding subscription by user ID:', error);
      throw error;
    }
  }

  async updateSubscriptionStatus(
    userId: string,
    status: string,
    plan: string,
    expiresAt: Date | null,
    features: Record<string, boolean>,
    paymentProviderId?: string,
  ): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { id: userId },
        data: {
          subscription_status: status,
          subscription_plan: plan,
          subscription_expires_at: expiresAt,
          subscription_features: features,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  async create(subscription: Subscription): Promise<Subscription> {
    try {
      // For now, we'll update the user record since subscriptions are stored in the users table
      await this.updateSubscriptionStatus(
        subscription.userId,
        subscription.status,
        subscription.plan,
        subscription.expiresAt,
        subscription.features.toJson(),
        subscription.paymentProviderId ?? undefined,
      );

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async update(subscription: Subscription): Promise<Subscription> {
    try {
      await this.updateSubscriptionStatus(
        subscription.userId,
        subscription.status,
        subscription.plan,
        subscription.expiresAt,
        subscription.features.toJson(),
        subscription.paymentProviderId ?? undefined,
      );

      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}
