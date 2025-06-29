import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class DosageDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

class FrequencyDto {
  @IsOptional()
  @IsNumber()
  times_per_day?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specific_days?: string[];
}

class RefillReminderDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsNumber()
  threshold?: number;

  @IsOptional()
  @IsDateString()
  last_refill?: string | null;

  @IsOptional()
  @IsDateString()
  next_refill?: string | null;

  @IsOptional()
  @IsNumber()
  supply_amount?: number;

  @IsOptional()
  @IsString()
  supply_unit?: string;
}

export class UpdateMedicationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DosageDto)
  dosage?: DosageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FrequencyDto)
  frequency?: FrequencyDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scheduled_times?: string[];

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
