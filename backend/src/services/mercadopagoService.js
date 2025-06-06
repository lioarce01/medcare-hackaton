import { supabase } from '../config/db.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

// Use the test seller's access token
const TEST_SELLER_ACCESS_TOKEN = 'TEST-5694633229708849-060521-d1c4f8e09c75aa221e0471535830ca99-173806729';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

class MercadoPagoService {
  async createSubscription(userId, priceId, currency = 'USD') {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Creating MercadoPago payment with:', {
        userId,
        priceId,
        currency,
        hasToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN
      });

      const preference = new Preference(client);

      const preferenceData = {
        items: [
          {
            title: "Premium Subscription",
            unit_price: Number(priceId),
            quantity: 1,
            currency_id: currency
          }
        ],
        back_urls: {
          success: "http://localhost:5173/subscription/success",
          failure: "http://localhost:5173/subscription",
          pending: "http://localhost:5173/subscription"
        },
        external_reference: userId,
        notification_url: "http://localhost:3000/api/subscriptions/mercadopago/webhook",
        payment_methods: {
          installments: 1,
          default_installments: 1,
          excluded_payment_types: [
            { id: "ticket" },
            { id: "atm" }
          ]
        },
        binary_mode: true
      };

      // Validate minimum amount
      if (Number(priceId) < 15) {
        throw new Error('Amount must be at least $15.00');
      }

      console.log('Preference data:', JSON.stringify(preferenceData, null, 2));

      try {
        const response = await preference.create({ body: preferenceData });
        console.log('MercadoPago response:', response);

        if (!response || !response.id) {
          throw new Error('Invalid response from MercadoPago');
        }

        // Return both the preference ID and the init point
        return {
          preferenceId: response.id,
          initPoint: response.sandbox_init_point || response.init_point
        };
      } catch (mpError) {
        console.error('MercadoPago API error:', {
          message: mpError.message,
          error: mpError.error,
          status: mpError.status,
          cause: mpError.cause,
          stack: mpError.stack,
          response: mpError.response?.data
        });
        throw mpError;
      }
    } catch (error) {
      console.error('Error creating Mercado Pago payment:', {
        message: error.message,
        error: error.error,
        status: error.status,
        cause: error.cause,
        stack: error.stack
      });
      throw error;
    }
  }

  async handleWebhookEvent(event) {
    try {
      const { type, data } = event;

      switch (type) {
        case 'payment':
          await this.handlePayment(data);
          break;
        case 'subscription':
          await this.handleSubscription(data);
          break;
        default:
          console.log('Unhandled webhook event type:', type);
      }
    } catch (error) {
      console.error('Error handling Mercado Pago webhook:', error);
      throw error;
    }
  }

  async handlePayment(payment) {
    const userId = payment.external_reference;
    const status = payment.status;

    // Map Mercado Pago status to our subscription status
    const subscriptionStatus = this.mapPaymentStatus(status);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Set expiration to 1 month from now

    // Update user's subscription status in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan: subscriptionStatus,
        subscription_expires_at: expiresAt.toISOString(),
        subscription_features: subscriptionStatus === 'premium' ? {
          smsReminders: true,
          customSounds: true,
          priorityNotifications: true,
          familyNotifications: true
        } : {
          smsReminders: false,
          customSounds: false,
          priorityNotifications: false,
          familyNotifications: false
        }
      })
      .eq('id', userId);

    if (error) throw error;
    return { userId, status: subscriptionStatus, paymentId: payment.id };
  }

  async handleSubscription(subscription) {
    const userId = subscription.external_reference;
    const status = subscription.status;
    const subscriptionStatus = this.mapSubscriptionStatus(status);
    const expiresAt = new Date(subscription.end_date);

    // Update user's subscription status in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan: subscriptionStatus,
        subscription_expires_at: expiresAt.toISOString(),
        subscription_features: subscriptionStatus === 'premium' ? {
          smsReminders: true,
          customSounds: true,
          priorityNotifications: true,
          familyNotifications: true
        } : {
          smsReminders: false,
          customSounds: false,
          priorityNotifications: false,
          familyNotifications: false
        }
      })
      .eq('id', userId);

    if (error) throw error;
    return { userId, status: subscriptionStatus, subscriptionId: subscription.id };
  }

  mapPaymentStatus(status) {
    switch (status) {
      case 'approved':
        return 'premium';
      case 'pending':
      case 'in_process':
        return 'free'; // Keep as free until payment is approved
      case 'rejected':
      case 'refunded':
      case 'cancelled':
        return 'free';
      default:
        return 'free';
    }
  }

  mapSubscriptionStatus(status) {
    switch (status) {
      case 'active':
        return 'premium';
      case 'pending':
        return 'free';
      case 'cancelled':
      case 'expired':
        return 'free';
      default:
        return 'free';
    }
  }
}

export default new MercadoPagoService(); 