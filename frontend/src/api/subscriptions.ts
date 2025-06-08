import { useMutation } from "@tanstack/react-query";
import axios from "../config/axios";

interface CreateCheckoutSessionParams {
  priceId: number;
  paymentProvider: "stripe" | "mercadopago";
  currency: string;
  cardToken?: string;
  email?: string;
}

interface CheckoutSessionResponse {
  url?: string;
  preferenceId?: string;
  initPoint?: string;
  preApprovalId?: string;
}

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      const response = await axios.post(
        "/api/subscriptions/create-checkout-session",
        params
      );
      return response.data as CheckoutSessionResponse;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};
