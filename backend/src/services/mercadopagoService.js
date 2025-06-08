import { supabase } from '../config/db.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

class MercadoPagoService {
  async createSubscription(userId, email, priceId, currency = 'ARS', cardToken = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

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
        payer: {
          email: email
        },
        back_urls: {
          success: `${process.env.BACKEND_URL}/api/subscriptions/success`,
          failure: `${process.env.BACKEND_URL}/api/subscriptions/failure`,
          pending: `${process.env.BACKEND_URL}/api/subscriptions/pending`
        },
        auto_return: "approved",
        external_reference: userId,
        notification_url: `${process.env.BACKEND_URL}/api/subscriptions/mercadopago/webhook`
      };

      const response = await preference.create({ body: preferenceData });
      return {
        preferenceId: response.id,
        initPoint: response.init_point
      };
    } catch (error) {
      console.error('Error creating Mercado Pago subscription:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      const payment = new Payment(client);
      return await payment.get({ id: paymentId });
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }
}

export default new MercadoPagoService(); 