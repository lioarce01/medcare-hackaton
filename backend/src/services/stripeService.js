import Stripe from 'stripe'
import dotenv from 'dotenv'
import { supabase } from '../config/db.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

class StripeService {
  async createCheckoutSession(userId, priceId) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription`,
        client_reference_id: userId,
        metadata: {
          userId: userId,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  async handleCheckoutSessionCompleted(session) {
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

    // Update user's subscription status in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'premium',
        subscription_plan: 'premium',
        subscription_expires_at: expiresAt,
        subscription_features: {
          smsReminders: true,
          customSounds: true,
          priorityNotifications: true,
          familyNotifications: true
        }
      })
      .eq('id', userId);

    if (error) throw error;
    return { userId, subscriptionId };
  }

  async handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata.userId;
    const status = subscription.status;
    const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

    // Update subscription status based on Stripe subscription status
    const subscriptionStatus = status === 'active' ? 'premium' : 'free';
    
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan: subscriptionStatus,
        subscription_expires_at: expiresAt,
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
    return subscription;
  }

  async handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata.userId;

    // Reset user to free tier
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'free',
        subscription_plan: 'free',
        subscription_expires_at: null,
        subscription_features: {
          smsReminders: false,
          customSounds: false,
          priorityNotifications: false,
          familyNotifications: false
        }
      })
      .eq('id', userId);

    if (error) throw error;
    return subscription;
  }
}

export default new StripeService(); 