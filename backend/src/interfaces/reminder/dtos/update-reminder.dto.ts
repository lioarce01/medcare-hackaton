import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReminderChannels } from 'src/domain/reminder/entities/reminder.entity';

class ChannelDto {
  @IsOptional()
  enabled: boolean = true;

  @IsOptional()
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

export class UpdateReminderDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsDateString()
  scheduled_datetime?: string; // ISO string, UTC

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
}
