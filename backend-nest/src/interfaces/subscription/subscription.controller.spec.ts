import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './http/controllers/subscription.controller';
import { CreateCheckoutSessionUseCase } from '../../application/subscription/use-cases/create-checkout-session.usecase';
import { GetSubscriptionStatusUseCase } from '../../application/subscription/use-cases/get-subscription-status.usecase';
import { HandleWebhookUseCase } from '../../application/subscription/use-cases/handle-webhook.usecase';
import { HandleSuccessRedirectUseCase } from '../../application/subscription/use-cases/handle-success-redirect.usecase';
import { PaymentProviderType } from '../../domain/subscription/services/payment-provider.interface';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let createCheckoutSessionUseCase: CreateCheckoutSessionUseCase;
  let getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: CreateCheckoutSessionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetSubscriptionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: HandleWebhookUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: HandleSuccessRedirectUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    createCheckoutSessionUseCase = module.get<CreateCheckoutSessionUseCase>(CreateCheckoutSessionUseCase);
    getSubscriptionStatusUseCase = module.get<GetSubscriptionStatusUseCase>(GetSubscriptionStatusUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session', async () => {
      const userId = 'test-user-id';
      const dto = {
        priceId: '1000',
        paymentProvider: PaymentProviderType.MERCADOPAGO,
        currency: 'ARS',
        email: 'test@example.com',
      };

      const expectedResult = {
        preferenceId: 'test-preference-id',
        initPoint: 'https://test-checkout-url.com',
      };

      jest.spyOn(createCheckoutSessionUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.createCheckoutSession(userId, dto);

      expect(createCheckoutSessionUseCase.execute).toHaveBeenCalledWith({
        userId,
        ...dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status', async () => {
      const userId = 'test-user-id';
      const expectedResult = {
        status: 'premium',
        plan: 'premium',
        expiresAt: '2024-12-31T23:59:59Z',
        features: {
          smsReminders: true,
          customSounds: true,
          priorityNotifications: true,
          familyNotifications: true,
        },
        isActive: true,
        isPremium: true,
      };

      jest.spyOn(getSubscriptionStatusUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.getSubscriptionStatus(userId);

      expect(getSubscriptionStatusUseCase.execute).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(expectedResult);
    });
  });
});
