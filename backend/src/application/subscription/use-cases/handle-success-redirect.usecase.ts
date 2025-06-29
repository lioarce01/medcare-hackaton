import { Injectable } from '@nestjs/common';
import { UpdateSubscriptionStatusUseCase } from './update-subscription-status.usecase';
import { SubscriptionStatus } from '../../../domain/subscription/entities/subscription.entity';

export interface HandleSuccessRedirectCommand {
  collectionStatus?: string;
  status?: string;
  externalReference?: string;
  paymentId?: string;
  collectionId?: string;
}

export interface SuccessRedirectResult {
  redirectUrl: string;
}

@Injectable()
export class HandleSuccessRedirectUseCase {
  constructor(
    private readonly updateSubscriptionStatusUseCase: UpdateSubscriptionStatusUseCase,
  ) {}

  async execute(command: HandleSuccessRedirectCommand): Promise<SuccessRedirectResult> {
    try {
      const { collectionStatus, status, externalReference, paymentId, collectionId } = command;
      
      console.log('Success route called:', { 
        collectionStatus, 
        status, 
        externalReference, 
        paymentId, 
        collectionId 
      });

      // If payment is approved, update subscription
      if ((collectionStatus === 'approved' || status === 'approved') && externalReference) {
        console.log('Payment approved in success route, updating subscription for user:', externalReference);
        
        try {
          await this.updateSubscriptionStatusUseCase.execute({
            userId: externalReference,
            subscriptionId: paymentId || collectionId,
            status: SubscriptionStatus.PREMIUM,
          });
          console.log('Subscription updated successfully from success route');
        } catch (updateError) {
          console.error('Error updating subscription from success route:', updateError);
        }
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/subscription/success?userId=${externalReference}&paymentId=${paymentId || collectionId}`;
      
      return { redirectUrl };
    } catch (error) {
      console.error('Error in success route:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return { redirectUrl: `${frontendUrl}/subscription/failure` };
    }
  }
}
