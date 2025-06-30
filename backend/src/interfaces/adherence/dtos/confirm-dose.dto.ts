import { IsString, IsUUID, IsOptional } from 'class-validator';

export class ConfirmDoseDto {
  @IsString()
  @IsUUID()
  adherenceId: string;

  @IsOptional()
  @IsString()
  takenTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
