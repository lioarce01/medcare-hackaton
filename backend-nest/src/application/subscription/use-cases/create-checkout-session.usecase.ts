import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentProvider, PaymentProviderType, CreateCheckoutSessionRequest, CheckoutSessionResponse } from '../../../domain/subscription/services/payment-provider.interface';

export interface CreateCheckoutSessionCommand {
  userId: string;
  priceId: string;
  paymentProvider: PaymentProviderType;
  currency?: string;
  email: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject('StripePaymentProvider') private readonly stripeProvider: PaymentProvider,
    @Inject('MercadoPagoPaymentProvider') private readonly mercadoPagoProvider: PaymentProvider,
  ) {}

  async execute(command: CreateCheckoutSessionCommand): Promise<CheckoutSessionResponse> {
    if (!command.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!command.priceId || !command.paymentProvider) {
      throw new BadRequestException('Price ID and payment provider are required');
    }

    const provider = this.getPaymentProvider(command.paymentProvider);
    
    const request: CreateCheckoutSessionRequest = {
      userId: command.userId,
      email: command.email,
      priceId: command.priceId,
      currency: command.currency || 'ARS',
    };

    try {
      return await provider.createCheckoutSession(request);
    } catch (error) {
      throw new BadRequestException(`Error creating checkout session: ${error.message}`);
    }
  }

  private getPaymentProvider(type: PaymentProviderType): PaymentProvider {
    switch (type) {
      case PaymentProviderType.STRIPE:
        return this.stripeProvider;
      case PaymentProviderType.MERCADOPAGO:
        return this.mercadoPagoProvider;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${type}`);
    }
  }
}
