import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import {
  PaymentProvider,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  WebhookResult,
  PaymentDetails,
} from '../../../domain/subscription/services/payment-provider.interface';

@Injectable()
export class MercadoPagoPaymentService implements PaymentProvider {
  private client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    // Initialize MercadoPago client
    this.client = new MercadoPagoConfig({
      accessToken:
        this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN') || '',
    });
  }

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest,
  ): Promise<CheckoutSessionResponse> {
    try {
      if (!this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN')) {
        throw new Error('MercadoPago access token is missing');
      }

      if (!request.userId) {
        throw new Error('User ID is required');
      }

      const preference = new Preference(this.client);

      const preferenceData = {
        items: [
          {
            id: 'premium-subscription',
            title: 'Premium Subscription',
            unit_price: parseFloat(request.priceId),
            quantity: 1,
            currency_id: request.currency,
          },
        ],
        payer: {
          email: request.email,
        },
        back_urls: {
          success: `${this.configService.get('BACKEND_URL')}/api/subscriptions/success`,
          failure: `${this.configService.get('BACKEND_URL')}/api/subscriptions/failure`,
          pending: `${this.configService.get('BACKEND_URL')}/api/subscriptions/pending`,
        },
        auto_return: 'approved',
        external_reference: request.userId,
        notification_url: `${this.configService.get('BACKEND_URL')}/api/subscriptions/mercadopago/webhook`,
      };

      console.log('🔍 MercadoPago Preference Data:', preferenceData);

      const response = await preference.create({ body: preferenceData });

      return {
        preferenceId: response.id,
        initPoint: response.init_point,
      };
    } catch (error) {
      console.error('Error creating Mercado Pago subscription:', error);
      throw error;
    }
  }

  async handleWebhook(
    payload: any,
    signature?: string,
  ): Promise<WebhookResult> {
    try {
      const {
        collection_status,
        status,
        external_reference,
        payment_id,
        collection_id,
        id,
        'data.id': dataId,
      } = payload;

      console.log('MercadoPago Webhook received:', {
        collection_status,
        status,
        external_reference,
        payment_id,
        collection_id,
        id,
        dataId,
      });

      const isApproved =
        collection_status === 'approved' || status === 'approved';

      return {
        success: true,
        userId: external_reference,
        paymentId: payment_id || collection_id || id || dataId,
        status: isApproved ? 'approved' : status || collection_status,
        shouldUpdateSubscription: isApproved && !!external_reference,
      };
    } catch (error) {
      console.error('Error handling MercadoPago webhook:', error);
      return {
        success: false,
      };
    }
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    try {
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: paymentId });

      return {
        id: String(paymentData.id || paymentId),
        status: paymentData.status || 'unknown',
        amount: paymentData.transaction_amount || 0,
        currency: paymentData.currency_id || 'ARS',
      };
    } catch (error) {
      console.error('Error getting MercadoPago payment:', error);
      throw error;
    }
  }
}
