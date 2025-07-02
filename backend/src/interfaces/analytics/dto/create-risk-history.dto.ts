import { IsDateString, IsNumber, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateRiskHistoryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsUUID()
  medication_id: string;

  @IsDateString()
  date: string; // ISO date string

  @IsNumber()
  risk_score: number;
}