import { IsBoolean, IsOptional, IsArray, IsString, IsObject, IsNumber } from 'class-validator';

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
    sms?: boolean;
    push?: boolean;
    reminder_before?: number;
  };
}
