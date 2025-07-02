import {
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  IsDateString,
  IsIn,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReminderChannels } from 'src/domain/reminder/entities/reminder.entity';

class ChannelDto {
  @IsOptional()
  @IsBoolean()
  enabled: boolean = true;

  @IsOptional()
  @IsBoolean()
  sent: boolean = false;

  @IsOptional()
  @IsString()
  sentAt?: string;
}

class ReminderChannelsDto implements ReminderChannels {
  @ValidateNested()
  @Type(() => ChannelDto)
  email: ChannelDto;

  @ValidateNested()
  @Type(() => ChannelDto)
  sms: ChannelDto;
}

export class CreateReminderDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsString()
  medication_id: string;

  @IsDateString()
  scheduled_datetime: string; // ISO string, UTC

  @IsOptional()
  @IsIn(['pending', 'sent', 'failed'])
  status?: 'pending' | 'sent' | 'failed';

  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderChannelsDto)
  channels?: ReminderChannels;

  @IsOptional()
  @IsString()
  message?: string | null;

  @IsOptional()
  @IsInt()
  retry_count?: number;

  @IsOptional()
  @IsDateString()
  last_retry?: string | null;

  @IsOptional()
  @IsString()
  adherence_id?: string | null;
}
