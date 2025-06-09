export interface PaymentProvider {
  createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse>;
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
}

export interface CreateCheckoutSessionRequest {
  userId: string;
  email: string;
  priceId: string;
  currency: string;
}

export interface CheckoutSessionResponse {
  sessionId?: string;
  preferenceId?: string;
  initPoint?: string;
  url?: string;
}

export interface WebhookResult {
  success: boolean;
  userId?: string;
  paymentId?: string;
  status?: string;
  shouldUpdateSubscription?: boolean;
}

export interface PaymentDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  userId?: string;
}

export enum PaymentProviderType {
  STRIPE = 'stripe',
  MERCADOPAGO = 'mercadopago',
}

export interface PaymentProviderFactory {
  getProvider(type: PaymentProviderType): PaymentProvider;
}
