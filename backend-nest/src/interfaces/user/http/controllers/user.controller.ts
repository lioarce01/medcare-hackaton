import {
  Controller,
  Put,
  Body,
  Param,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { DeleteUserUseCase } from 'src/application/user/use-cases/delete-user.usecase';
import { FindUserByIdUseCase } from 'src/application/user/use-cases/find-user-by-id.usecase';
import { UpdateUserSettingsUseCase } from 'src/application/user/use-cases/update-user-settings.usecase';
import { UpdateUserUseCase } from 'src/application/user/use-cases/update-user.usecase';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';
import { UserPresenter } from 'src/domain/user/presenters/user.presenter';
import { UpdateUserSettingsDto } from 'src/infrastructure/user/dtos/update-user-settings.dto';
import { UpdateUserDto } from 'src/infrastructure/user/dtos/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    readonly updateUserUseCase: UpdateUserUseCase,
    readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
    readonly findUserByIdUseCase: FindUserByIdUseCase,
    readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    const userAggregate = await this.findUserByIdUseCase.execute(id);
    return UserPresenter.toHttp(userAggregate);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
    return { message: 'User deleted successfully' };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto, // idealmente aquí defines un DTO con validación class-validator
  ) {
    // Mapeo de body a UserAggregate (ejemplo simplificado)
    const userAggregate = UserMapper.toDomain(
      { ...updateUserDto, id }, // simulamos prismaUser con id del path + body props
      '',
    );

    const updatedUser = await this.updateUserUseCase.execute(userAggregate);

    // Formateamos para la respuesta HTTP
    return UserPresenter.toHttp(updatedUser);
  }

  @Patch(':id/settings')
  async updateSettings(
    @Param('userId') userId: string,
    @Body() updateSettingsDto: UpdateUserSettingsDto,
  ) {
    const updatedSettings = await this.updateUserSettingsUseCase.execute(
      userId,
      updateSettingsDto,
    );
    return UserPresenter.toSettingsJson(updatedSettings);
  }
}
