# Stripe Integration Setup Guide

## Environment Variables Required

Create a `.env` file in the `backend-nest` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medcare"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_PRICE_ID=price_your_stripe_price_id_here

# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Supabase Configuration (if using Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Frontend Environment Variables

Create a `.env` file in the `frontend-restyle` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PRICE_ID=price_your_stripe_price_id_here
```

## Stripe Setup Steps

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Get Your API Keys**: 
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your Publishable Key and Secret Key

3. **Create a Product and Price**:
   ```bash
   cd backend-nest
   node scripts/create-stripe-price.js
   ```
   This will create a $10/month subscription product and price.

4. **Set Up Webhooks**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/subscriptions/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret

5. **Update Environment Variables**:
   - Replace `sk_test_your_stripe_secret_key_here` with your actual Stripe secret key
   - Replace `whsec_your_stripe_webhook_secret_here` with your webhook signing secret
   - Replace `price_your_stripe_price_id_here` with the price ID from step 3

## Testing the Integration

1. Start the backend:
   ```bash
   cd backend-nest
   npm run start:dev
   ```

2. Start the frontend:
   ```bash
   cd frontend-restyle
   npm run dev
   ```

3. Navigate to the subscription page and test both Stripe and MercadoPago payment methods.

## Features Implemented

- ✅ Stripe checkout session creation
- ✅ Stripe webhook handling
- ✅ Subscription status updates
- ✅ Payment method selection (Stripe vs MercadoPago)
- ✅ $10 USD monthly subscription
- ✅ Success/failure redirects
- ✅ Error handling and user feedback

## Payment Flow

1. User selects payment method (Stripe or MercadoPago)
2. User clicks "Upgrade to Premium"
3. Backend creates checkout session with selected provider
4. User is redirected to payment provider's checkout page
5. After payment, user is redirected back to success page
6. Webhook updates subscription status in database
7. User sees premium features activated 