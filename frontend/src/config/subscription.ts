export const SUBSCRIPTION_CONFIG = {
  prices: {
    stripe: import.meta.env.VITE_STRIPE_PRICE_ID || "price_premium_monthly",
    mercadopago: {
      USD: 15.0,
      BRL: 75.0,
      CNY: 100.0,
      ARS: 20000.0,
    },
  },
  currency: {
    USD: {
      symbol: "$",
      amount: 15.0,
      code: "USD",
    },
    BRL: {
      symbol: "R$",
      amount: 75.0,
      code: "BRL",
    },
    CNY: {
      symbol: "¥",
      amount: 100.0,
      code: "CNY",
    },
    ARS: {
      symbol: "$",
      amount: 20000.0,
      code: "ARS",
    },
  },
};
