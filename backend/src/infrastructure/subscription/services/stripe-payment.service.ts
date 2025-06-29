import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentProvider,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  WebhookResult,
  PaymentDetails,
} from '../../../domain/subscription/services/payment-provider.interface';

@Injectable()
export class StripePaymentService implements PaymentProvider {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    // Initialize Stripe
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
    );
  }

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest,
  ): Promise<CheckoutSessionResponse> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: request.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${this.configService.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/subscription`,
        client_reference_id: request.userId,
        metadata: {
          userId: request.userId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url || undefined,
      };
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  async handleWebhook(
    payload: any,
    signature?: string,
  ): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature || '',
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
      );

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event.data.object);
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event.data.object);
        default:
          return { success: true };
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      return { success: false };
    }
  }

  private async handleCheckoutSessionCompleted(
    session: any,
  ): Promise<WebhookResult> {
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;

    return {
      success: true,
      userId,
      paymentId: subscriptionId,
      status: 'completed',
      shouldUpdateSubscription: true,
    };
  }

  private async handleSubscriptionCreated(
    subscription: any,
  ): Promise<WebhookResult> {
    const userId = subscription.metadata?.userId;
    const status = subscription.status;

    return {
      success: true,
      userId,
      paymentId: subscription.id,
      status,
      shouldUpdateSubscription: status === 'active',
    };
  }

  private async handleSubscriptionUpdated(
    subscription: any,
  ): Promise<WebhookResult> {
    const userId = subscription.metadata?.userId;
    const status = subscription.status;

    return {
      success: true,
      userId,
      paymentId: subscription.id,
      status,
      shouldUpdateSubscription: status === 'active',
    };
  }

  private async handleSubscriptionDeleted(
    subscription: any,
  ): Promise<WebhookResult> {
    const userId = subscription.metadata?.userId;

    return {
      success: true,
      userId,
      paymentId: subscription.id,
      status: 'deleted',
      shouldUpdateSubscription: true,
    };
  }

  private async handleInvoicePaymentSucceeded(
    invoice: any,
  ): Promise<WebhookResult> {
    const userId = invoice.metadata?.userId;
    const status = 'paid';

    return {
      success: true,
      userId,
      paymentId: invoice.id,
      status,
      shouldUpdateSubscription: true,
    };
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    try {
      // const subscription = await this.stripe.subscriptions.retrieve(paymentId);

      // Mock response
      const subscription = {
        id: paymentId,
        status: 'premium',
        items: {
          data: [{ price: { unit_amount: 1500, currency: 'usd' } }],
        },
      };

      return {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency,
      };
    } catch (error) {
      console.error('Error getting Stripe payment details:', error);
      throw error;
    }
  }

  async verifySession(sessionId: string): Promise<WebhookResult> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid' && session.status === 'complete') {
        const userId = session.client_reference_id || undefined;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id || undefined;

        return {
          success: true,
          userId,
          paymentId: subscriptionId,
          status: 'completed',
          shouldUpdateSubscription: true,
        };
      }

      return {
        success: false,
        status: session.payment_status,
        shouldUpdateSubscription: false,
      };
    } catch (error) {
      console.error('Error verifying Stripe session:', error);
      return { success: false };
    }
  }
}
