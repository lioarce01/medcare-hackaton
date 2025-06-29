import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class ConfirmDoseDto {
  @Expose({ name: 'adherence_id' })
  @IsString()
  @IsUUID()
  adherenceId: string;

  @Expose({ name: 'taken_time' })
  @IsString()
  takenTime: string;

  @Expose()
  notes?: string;
}
