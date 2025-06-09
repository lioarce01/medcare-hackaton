import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../../../domain/subscription/repositories/subscription.repository';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (!subscription) {
        throw new ForbiddenException('No subscription found');
      }

      // Check if user has an active premium subscription
      const isPremium = subscription.isPremium();
      
      if (!isPremium) {
        throw new ForbiddenException('Premium subscription required');
      }

      // Add subscription info to request for use in controllers
      request.subscription = subscription;
      
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error checking subscription:', error);
      throw new ForbiddenException('Error checking subscription status');
    }
  }
}
