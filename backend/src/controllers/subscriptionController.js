import { supabase, supabaseAdmin } from '../config/db.js';
import stripeService from '../services/stripeService.js';
import mercadopagoService from '../services/mercadopagoService.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { priceId, paymentProvider, currency, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!priceId || !paymentProvider) {
      return res.status(400).json({ error: 'Price ID and payment provider are required' });
    }

    const result = await mercadopagoService.createSubscription(
      userId,
      email,
      priceId,
      currency || 'ARS'
    );
    res.json(result);
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
    // Obtenemos los datos tanto de query como de body
    const queryData = req.query;
    const bodyData = req.body || {};
    
    const {
      collection_status,
      status,
      external_reference,
      payment_id,
      collection_id,
      id,
      'data.id': dataId
    } = { ...queryData, ...bodyData };

    console.log('Webhook received:', {
      collection_status,
      status,
      external_reference,
      payment_id,
      collection_id,
      id,
      dataId,
      query: req.query,
      body: req.body
    });

    // Si el pago está aprobado, actualizamos la suscripción
    if ((collection_status === 'approved' || status === 'approved') && external_reference) {
      console.log('Payment approved, updating subscription for user:', external_reference);
      try {
        await updateSubscriptionStatus(external_reference, payment_id || collection_id || id || dataId, 'premium');
        console.log('Subscription updated successfully');
      } catch (updateError) {
        console.error('Error updating subscription:', updateError);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(200).json({ received: true });
  }
};

// Ruta de éxito que también actualiza la suscripción
export const handleSuccess = async (req, res) => {
  try {
    const { collection_status, status, external_reference, payment_id, collection_id } = req.query;
    console.log('Success route called:', { collection_status, status, external_reference, payment_id, collection_id });

    if ((collection_status === 'approved' || status === 'approved') && external_reference) {
      console.log('Payment approved in success route, updating subscription for user:', external_reference);
      try {
        await updateSubscriptionStatus(external_reference, payment_id || collection_id, 'premium');
        console.log('Subscription updated successfully from success route');
      } catch (updateError) {
        console.error('Error updating subscription from success route:', updateError);
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/subscription/success?userId=${external_reference}&paymentId=${payment_id || collection_id}`);
  } catch (error) {
    console.error('Error in success route:', error);
    res.redirect(`${process.env.FRONTEND_URL}/subscription/failure`);
  }
};

export const updateSubscriptionStatus = async (userId, subscriptionId, status) => {
  try {
    console.log('Updating subscription for user:', userId);
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mes de suscripción

    const updateData = {
      subscription_status: status,
      subscription_plan: status,
      subscription_expires_at: expiresAt.toISOString(),
      subscription_features: status === 'premium' ? {
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
    };

    console.log('Update data:', updateData);

    // Primero verificamos si el usuario existe usando supabaseAdmin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId);

    console.log('User check result:', { userData, userError });

    if (userError) {
      console.error('Error checking user:', userError);
      throw userError;
    }

    if (!userData || userData.length === 0) {
      console.error('No user found with ID:', userId);
      throw new Error(`No user found with ID: ${userId}`);
    }

    // Si el usuario existe, intentamos la actualización usando supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    // Verificamos que la actualización fue exitosa usando supabaseAdmin
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('subscription_status, subscription_plan, subscription_expires_at, subscription_features')
      .eq('id', userId)
      .single();

    console.log('Verification result:', { verifyData, verifyError });

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      throw verifyError;
    }

    return verifyData;
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