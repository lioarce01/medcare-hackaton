export const SUBSCRIPTION_CONFIG = {
  prices: {
    stripe: import.meta.env.VITE_STRIPE_PRICE_ID || "price_premium_monthly",
    mercadopago: {
      USD: 10.0,
      ARS: 10000.0,
    },
  },
  currency: {
    USD: {
      symbol: "$",
      amount: 10.0,
      code: "USD",
    },
    ARS: {
      symbol: "$",
      amount: 10000.0,
      code: "ARS",
    },
  },
} as const
