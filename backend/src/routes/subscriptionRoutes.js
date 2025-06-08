import express from 'express'
import {
  createCheckoutSession,
  handleWebhook,
  handleMercadoPagoWebhook,
  handleSuccess,
  getSubscriptionStatus,
} from '../controllers/subscriptionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

// Create a checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Handle Stripe webhooks - needs raw body for signature verification
router.post('/webhooks/stripe', handleWebhook);

// Handle Mercado Pago webhooks
router.post('/mercadopago/webhook', express.json(), handleMercadoPagoWebhook);

// Get subscription status
router.get('/status', protect, getSubscriptionStatus);

// Rutas de redirección de MercadoPago
router.get('/success', handleSuccess);

router.get('/failure', (req, res) => {
  const { external_reference } = req.query;
  res.redirect(`${process.env.FRONTEND_URL}/subscription/failure?userId=${external_reference}`);
});

router.get('/pending', (req, res) => {
  const { external_reference } = req.query;
  res.redirect(`${process.env.FRONTEND_URL}/subscription/pending?userId=${external_reference}`);
});

export default router