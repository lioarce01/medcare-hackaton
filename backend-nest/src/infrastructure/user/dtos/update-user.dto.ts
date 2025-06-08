import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmergencyContactDto {
  @IsString()
  name!: string;

  @IsString()
  phone_number!: string;

  @IsString()
  relationship!: string;
}

class SubscriptionFeaturesDto {
  @IsBoolean()
  custom_reminders!: boolean;

  @IsBoolean()
  custom_notifications!: boolean;

  @IsBoolean()
  risk_analytics!: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  password?: string | null;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[] | null;

  @IsOptional()
  @IsBoolean()
  is_admin?: boolean;

  @IsOptional()
  @IsString()
  phone_number?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergency_contact?: EmergencyContactDto | null;

  @IsOptional()
  @IsString()
  subscription_status?: string | null;

  @IsOptional()
  @IsString()
  subscription_plan?: string | null;

  @IsOptional()
  @IsDateString()
  subscription_expires_at?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionFeaturesDto)
  subscription_features?: SubscriptionFeaturesDto | null;
}
