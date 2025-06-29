import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../../domain/subscription/repositories/subscription.repository';
import { SubscriptionDomainService } from '../../../domain/subscription/services/subscription-domain.service';
import { SubscriptionStatus, SubscriptionPlan, SubscriptionFeatures } from '../../../domain/subscription/entities/subscription.entity';

export interface UpdateSubscriptionStatusCommand {
  userId: string;
  subscriptionId?: string;
  status: SubscriptionStatus;
  months?: number;
}

@Injectable()
export class UpdateSubscriptionStatusUseCase {
  constructor(
    @Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionDomainService: SubscriptionDomainService,
  ) {}

  async execute(command: UpdateSubscriptionStatusCommand): Promise<void> {
    console.log('Updating subscription for user:', command.userId);
    
    let subscription = await this.subscriptionRepository.findByUserId(command.userId);
    
    if (!subscription) {
      // Create new subscription if none exists
      if (command.status === SubscriptionStatus.PREMIUM) {
        subscription = this.subscriptionDomainService.createPremiumSubscription(
          command.userId, 
          command.subscriptionId,
          command.months || 1
        );
      } else {
        subscription = this.subscriptionDomainService.createFreeSubscription(command.userId);
      }
      await this.subscriptionRepository.create(subscription);
    } else {
      // Update existing subscription
      if (command.status === SubscriptionStatus.PREMIUM) {
        this.subscriptionDomainService.upgradeToPremium(
          subscription, 
          command.subscriptionId,
          command.months || 1
        );
      } else {
        this.subscriptionDomainService.downgradeToFree(subscription);
      }
      await this.subscriptionRepository.update(subscription);
    }

    // Also update user table directly for backward compatibility
    const expiresAt = command.status === SubscriptionStatus.PREMIUM 
      ? this.subscriptionDomainService.calculateExpirationDate(command.months || 1)
      : null;

    const features = command.status === SubscriptionStatus.PREMIUM 
      ? SubscriptionFeatures.createPremiumFeatures().toJson()
      : SubscriptionFeatures.createFreeFeatures().toJson();

    await this.subscriptionRepository.updateSubscriptionStatus(
      command.userId,
      command.status,
      command.status, // plan same as status
      expiresAt,
      features,
      command.subscriptionId
    );

    console.log('Subscription updated successfully');
  }
}
