import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

class NotificationPreferencesDto {
  @IsBoolean()
  email!: boolean;

  @IsBoolean()
  push!: boolean;
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
  notification_preferences?: NotificationPreferencesDto | null;
}
