import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from '../../../domain/subscription/repositories/subscription.repository';
import { SubscriptionPresenter, SubscriptionPresentation } from '../../../domain/subscription/presenters/subscription.presenter';
import { SubscriptionDomainService } from '../../../domain/subscription/services/subscription-domain.service';

export interface GetSubscriptionStatusQuery {
  userId: string;
}

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(
    @Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionDomainService: SubscriptionDomainService,
  ) {}

  async execute(query: GetSubscriptionStatusQuery): Promise<SubscriptionPresentation> {
    const subscription = await this.subscriptionRepository.findByUserId(query.userId);
    
    if (!subscription) {
      // Create a default free subscription if none exists
      const freeSubscription = this.subscriptionDomainService.createFreeSubscription(query.userId);
      return SubscriptionPresenter.present(freeSubscription);
    }

    // Check if subscription is expired and downgrade if necessary
    if (this.subscriptionDomainService.isSubscriptionExpired(subscription)) {
      this.subscriptionDomainService.downgradeToFree(subscription);
      await this.subscriptionRepository.update(subscription);
    }

    return SubscriptionPresenter.present(subscription);
  }
}
