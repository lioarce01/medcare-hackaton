import { IsDateString, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateRiskHistoryDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  medication_id: string;

  @IsDateString()
  date: string; // ISO date string

  @IsNumber()
  risk_score: number;
}