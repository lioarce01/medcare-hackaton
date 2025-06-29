import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class NotificationPreferencesDto {
  @IsBoolean()
  email!: boolean;

  @IsBoolean()
  sms!: boolean;

  @IsBoolean()
  push!: boolean;

  @IsNumber()
  reminder_before!: number;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  email_enabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred_times?: string[];

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notification_preferences?: NotificationPreferencesDto | null;
}
