import {
  IsString,
  IsOptional,
  IsObject,
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

export class CreateReminderDto {
  @IsString()
  user_id: string;

  @IsString()
  medication_id: string;

  @IsString()
  scheduled_time: string;

  @IsDateString()
  scheduled_date: string;

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
