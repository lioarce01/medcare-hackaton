import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';
import { UserController } from './interfaces/user/http/controllers/user.controller';
import { FindUserByIdUseCase } from './application/user/use-cases/get-me.usecase';
import { UpdateUserUseCase } from './application/user/use-cases/update-user.usecase';
import { DeleteUserUseCase } from './application/user/use-cases/delete-user.usecase';
import { UpdateUserSettingsUseCase } from './application/user/use-cases/update-user-settings.usecase';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateUserSettingsUseCase,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
