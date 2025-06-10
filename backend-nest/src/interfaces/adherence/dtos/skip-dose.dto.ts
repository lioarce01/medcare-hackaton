import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class SkipDoseDto {
  @Expose({ name: 'adherence_id' })
  @IsString()
  @IsUUID()
  adherenceId: string;
}
