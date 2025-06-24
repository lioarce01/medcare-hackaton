import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
  RawBody,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GetUserId } from '../../../common/decorators/get-user-id.decorator';
import { CreateCheckoutSessionDto } from '../dtos/create-checkout-session.dto';
import { SubscriptionStatusDto } from '../dtos/subscription-status.dto';
import { CreateCheckoutSessionUseCase } from '../../../../application/subscription/use-cases/create-checkout-session.usecase';
import { GetSubscriptionStatusUseCase } from '../../../../application/subscription/use-cases/get-subscription-status.usecase';
import { HandleWebhookUseCase } from '../../../../application/subscription/use-cases/handle-webhook.usecase';
import { HandleSuccessRedirectUseCase } from '../../../../application/subscription/use-cases/handle-success-redirect.usecase';
import { PaymentProviderType } from '../../../../domain/subscription/services/payment-provider.interface';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
    private readonly handleSuccessRedirectUseCase: HandleSuccessRedirectUseCase,
  ) { }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @GetUserId() userId: string,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    console.log('📦 Checkout Session Request:', {
      userId,
      ...createCheckoutSessionDto,
    });
    return await this.createCheckoutSessionUseCase.execute({
      userId,
      ...createCheckoutSessionDto,
    });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(
    @GetUserId() userId: string,
  ): Promise<SubscriptionStatusDto> {
    return await this.getSubscriptionStatusUseCase.execute({ userId });
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return await this.handleWebhookUseCase.execute({
      paymentProvider: PaymentProviderType.STRIPE,
      payload,
      signature,
    });
  }

  @Post('mercadopago/webhook')
  async handleMercadoPagoWebhook(@Body() body: any, @Query() query: any) {
    // Combine query and body data as in the original implementation
    const payload = { ...query, ...body };

    return await this.handleWebhookUseCase.execute({
      paymentProvider: PaymentProviderType.MERCADOPAGO,
      payload,
    });
  }

  @Get('success')
  async handleSuccess(@Query() query: any, @Res() res: Response) {
    const result = await this.handleSuccessRedirectUseCase.execute({
      collectionStatus: query.collection_status,
      status: query.status,
      externalReference: query.external_reference,
      paymentId: query.payment_id,
      collectionId: query.collection_id,
    });

    res.redirect(result.redirectUrl);
  }

  @Get('failure')
  async handleFailure(
    @Query('external_reference') externalReference: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/subscription/failure?userId=${externalReference}`,
    );
  }

  @Get('pending')
  async handlePending(
    @Query('external_reference') externalReference: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/subscription/pending?userId=${externalReference}`,
    );
  }
}
