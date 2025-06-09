import { IsString, IsUUID } from 'class-validator';

export class ConfirmDoseDto {
  @IsString()
  @IsUUID()
  adherenceId: string;
}
