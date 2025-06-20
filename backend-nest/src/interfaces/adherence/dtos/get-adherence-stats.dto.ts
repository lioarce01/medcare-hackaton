import { IsOptional, IsDateString, IsString } from 'class-validator';

export class GetAdherenceStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  timezone?: string; // Nueva propiedad para la zona horaria del usuario
}
