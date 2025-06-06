import { supabase } from '../config/db.js';
import stripeService from '../services/stripeService.js';
import mercadopagoService from '../services/mercadopagoService.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    // Log the entire request for debugging
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

    const userId = req.user?.id;
    const { priceId, paymentProvider, currency } = req.body;

    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Creating checkout session with:', {
      userId,
      priceId,
      paymentProvider,
      currency
    });

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    if (!paymentProvider) {
      return res.status(400).json({ error: 'Payment provider is required' });
    }

    try {
      if (paymentProvider === 'mercadopago') {
        const result = await mercadopagoService.createSubscription(
          userId,
          priceId,
          currency || 'USD'
        );
        res.json(result);
      } else {
        // Default to Stripe
        const session = await stripeService.createCheckoutSession(userId, priceId);
        res.json({ url: session.url });
      }
    } catch (paymentError) {
      console.error('Payment provider error:', {
        error: paymentError.message,
        stack: paymentError.stack,
        provider: paymentProvider
      });
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    await mercadopagoService.handleWebhookEvent({ type, data });
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Mercado Pago webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const updateSubscriptionStatus = async (userId, subscriptionId, status) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription: {
          status: status,
          subscriptionId: subscriptionId,
          updatedAt: new Date().toISOString(),
        },
      })
      .eq('id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_plan, subscription_expires_at, subscription_features')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    res.json({
      status: user.subscription_status,
      plan: user.subscription_plan,
      expiresAt: user.subscription_expires_at,
      features: user.subscription_features
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
}; 