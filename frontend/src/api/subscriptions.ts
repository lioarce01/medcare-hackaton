import { useMutation } from "@tanstack/react-query";
import axios from "../config/axios";

interface CreateCheckoutSessionParams {
  priceId: number;
  paymentProvider: "stripe" | "mercadopago";
  currency: string;
}

interface CheckoutSessionResponse {
  url: string;
}

const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResponse> => {
  const response = await axios.post<CheckoutSessionResponse>(
    "/api/subscriptions/create-checkout-session",
    params
  );
  return response.data;
};

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};
