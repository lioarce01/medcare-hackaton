import { IsString, IsUUID } from 'class-validator';

export class SkipDoseDto {
  @IsString()
  @IsUUID()
  adherenceId: string;
}
