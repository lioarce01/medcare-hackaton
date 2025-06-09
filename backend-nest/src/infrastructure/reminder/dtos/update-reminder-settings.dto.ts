import { IsBoolean, IsOptional, IsArray, IsString, IsObject } from 'class-validator';

export class UpdateReminderSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTimes?: string[];

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}
