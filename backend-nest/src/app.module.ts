import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { MedicationModule } from './interfaces/medication/medication.module';
import { AdherenceModule } from './interfaces/adherence/adherence.module';
import { UserModule } from './interfaces/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UserModule,
    MedicationModule,
    AdherenceModule,
  ],
})
export class AppModule {}
