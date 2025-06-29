import apiClient from "@/config/api"

export interface CreateCheckoutSessionParams {
  priceId: string
  paymentProvider: "stripe" | "mercadopago"
  currency: string
  email: string
}

export interface CheckoutSessionResponse {
  url?: string;
  preferenceId?: string;
  initPoint?: string;
  preApprovalId?: string;
  sessionId?: string;
}

export const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const response = await apiClient.post(
    "/subscriptions/create-checkout-session",
    params
  );
  return response.data as CheckoutSessionResponse;
}