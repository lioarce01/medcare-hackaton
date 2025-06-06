import express from 'express'
import {
  createCheckoutSession,
  handleWebhook,
  handleMercadoPagoWebhook,
  getSubscriptionStatus,
} from '../controllers/subscriptionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

// Create a checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Handle Stripe webhooks - needs raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Handle Mercado Pago webhooks
router.post('/mercadopago/webhook', express.json(), handleMercadoPagoWebhook);

// Get subscription status
router.get('/status', protect, getSubscriptionStatus);

export default router