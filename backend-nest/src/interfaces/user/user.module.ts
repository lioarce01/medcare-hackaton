import { Module } from '@nestjs/common';
import { UserController } from './http/controllers/user.controller';
import { SupabaseUserRepository } from '../../infrastructure/user/repositories/supabase-user.repository';
import { GetMeUseCase } from '../../application/user/use-cases/get-me.usecase';
import { UpdateUserUseCase } from '../../application/user/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/user/use-cases/delete-user.usecase';
import { UpdateUserSettingsUseCase } from '../../application/user/use-cases/update-user-settings.usecase';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    GetMeUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateUserSettingsUseCase,
    {
      provide: 'UserRepository',
      useClass: SupabaseUserRepository,
    },
  ],
})
export class UserModule {}
