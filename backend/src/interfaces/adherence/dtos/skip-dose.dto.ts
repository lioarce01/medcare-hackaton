import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SkipDoseDto {
  @IsString()
  @IsUUID()
  adherenceId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
