import { Injectable, Inject } from '@nestjs/common';
import { PaymentProvider, PaymentProviderType, WebhookResult } from '../../../domain/subscription/services/payment-provider.interface';
import { UpdateSubscriptionStatusUseCase } from './update-subscription-status.usecase';
import { SubscriptionStatus } from '../../../domain/subscription/entities/subscription.entity';

export interface HandleWebhookCommand {
  paymentProvider: PaymentProviderType;
  payload: any;
  signature?: string;
}

@Injectable()
export class HandleWebhookUseCase {
  constructor(
    @Inject('StripePaymentProvider') private readonly stripeProvider: PaymentProvider,
    @Inject('MercadoPagoPaymentProvider') private readonly mercadoPagoProvider: PaymentProvider,
    private readonly updateSubscriptionStatusUseCase: UpdateSubscriptionStatusUseCase,
  ) {}

  async execute(command: HandleWebhookCommand): Promise<{ received: boolean }> {
    try {
      const provider = this.getPaymentProvider(command.paymentProvider);
      const result = await provider.handleWebhook(command.payload, command.signature);

      if (result.success && result.shouldUpdateSubscription && result.userId) {
        console.log('Payment approved, updating subscription for user:', result.userId);
        
        try {
          await this.updateSubscriptionStatusUseCase.execute({
            userId: result.userId,
            subscriptionId: result.paymentId,
            status: SubscriptionStatus.PREMIUM,
          });
          console.log('Subscription updated successfully');
        } catch (updateError) {
          console.error('Error updating subscription:', updateError);
        }
      }

      return { received: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { received: true }; // Return success to avoid webhook retries
    }
  }

  private getPaymentProvider(type: PaymentProviderType): PaymentProvider {
    switch (type) {
      case PaymentProviderType.STRIPE:
        return this.stripeProvider;
      case PaymentProviderType.MERCADOPAGO:
        return this.mercadoPagoProvider;
      default:
        throw new Error(`Unsupported payment provider: ${type}`);
    }
  }
}
