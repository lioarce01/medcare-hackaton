import {
  Controller,
  Put,
  Body,
  Param,
  Patch,
  Get,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeleteUserUseCase } from 'src/application/user/use-cases/delete-user.usecase';
import { GetMeUseCase } from 'src/application/user/use-cases/get-me.usecase';
import { UpdateUserSettingsUseCase } from 'src/application/user/use-cases/update-user-settings.usecase';
import { UpdateUserUseCase } from 'src/application/user/use-cases/update-user.usecase';
import { GetUserId } from 'src/interfaces/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/interfaces/common/guards/jwt-auth.guard';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';
import { UserPresenter } from 'src/domain/user/presenters/user.presenter';
import { UpdateUserSettingsDto } from 'src/interfaces/user/dtos/update-user-settings.dto';
import { UpdateUserDto } from 'src/interfaces/user/dtos/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    readonly updateUserUseCase: UpdateUserUseCase,
    readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
    readonly getMeUseCase: GetMeUseCase,
    readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@GetUserId() userId: string) {
    const userAggregate = await this.getMeUseCase.execute(userId);
    return UserPresenter.toHttp(userAggregate);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Patch('me/settings')
  async updateSettings(
    @GetUserId() userId: string,
    @Body() updateSettingsDto: UpdateUserSettingsDto,
  ) {
    const updatedSettings = await this.updateUserSettingsUseCase.execute(
      userId,
      updateSettingsDto,
    );
    return UserPresenter.toSettingsJson(updatedSettings);
  }
}
