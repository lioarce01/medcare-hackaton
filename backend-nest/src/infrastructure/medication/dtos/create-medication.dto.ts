import {
  IsString,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class DosageDto {
  @IsNumber()
  amount: number;

  @IsString()
  unit: string;
}

class FrequencyDto {
  @IsNumber()
  times_per_day: number;

  @IsArray()
  @IsString({ each: true })
  specific_days: string[];
}

class RefillReminderDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  threshold: number;

  @IsOptional()
  @IsDateString()
  last_refill?: string | null;

  @IsOptional()
  @IsDateString()
  next_refill?: string | null;

  @IsNumber()
  supply_amount: number;

  @IsString()
  supply_unit: string;
}

export class CreateMedicationDto {
  @IsString()
  name: string;

  @IsString()
  user_id: string;

  @ValidateNested()
  @Type(() => DosageDto)
  dosage: DosageDto;

  @ValidateNested()
  @Type(() => FrequencyDto)
  frequency: FrequencyDto;

  @IsArray()
  @IsString({ each: true })
  scheduled_times: string[];

  @IsOptional()
  @IsString()
  instructions?: string | null;

  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @IsOptional()
  @IsDateString()
  end_date?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => RefillReminderDto)
  refill_reminder?: RefillReminderDto | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  side_effects_to_watch?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  medication_type?: string | null;

  @IsOptional()
  @IsString()
  image_url?: string | null;
}
