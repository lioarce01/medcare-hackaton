import { IsOptional, IsDateString } from 'class-validator';

export class GetAdherenceStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
