import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PaymentProviderType } from '../../../../domain/subscription/services/payment-provider.interface';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsEnum(PaymentProviderType)
  @IsNotEmpty()
  paymentProvider: PaymentProviderType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
