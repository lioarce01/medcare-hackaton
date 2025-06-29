import { Module } from '@nestjs/common';
import { SubscriptionController } from './http/controllers/subscription.controller';
import { SupabaseSubscriptionRepository } from '../../infrastructure/subscription/repositories/supabase-subscription.repository';
import { StripePaymentService } from '../../infrastructure/subscription/services/stripe-payment.service';
import { MercadoPagoPaymentService } from '../../infrastructure/subscription/services/mercadopago-payment.service';
import { SubscriptionDomainService } from '../../domain/subscription/services/subscription-domain.service';
import { CreateCheckoutSessionUseCase } from '../../application/subscription/use-cases/create-checkout-session.usecase';
import { GetSubscriptionStatusUseCase } from '../../application/subscription/use-cases/get-subscription-status.usecase';
import { HandleWebhookUseCase } from '../../application/subscription/use-cases/handle-webhook.usecase';
import { HandleSuccessRedirectUseCase } from '../../application/subscription/use-cases/handle-success-redirect.usecase';
import { UpdateSubscriptionStatusUseCase } from '../../application/subscription/use-cases/update-subscription-status.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [SubscriptionController],
  providers: [
    PrismaService,
    SubscriptionDomainService,
    CreateCheckoutSessionUseCase,
    GetSubscriptionStatusUseCase,
    HandleWebhookUseCase,
    HandleSuccessRedirectUseCase,
    UpdateSubscriptionStatusUseCase,
    {
      provide: 'SubscriptionRepository',
      useClass: SupabaseSubscriptionRepository,
    },
    {
      provide: 'StripePaymentProvider',
      useClass: StripePaymentService,
    },
    {
      provide: 'MercadoPagoPaymentProvider',
      useClass: MercadoPagoPaymentService,
    },
  ],
  exports: ['SubscriptionRepository', SubscriptionDomainService],
})
export class SubscriptionModule {}
