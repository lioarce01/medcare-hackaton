import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/user/repositories/user.repository';
import { UserSettings } from 'src/domain/user/entities/user-settings.entity';

@Injectable()
export class UpdateUserSettingsUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    settingsUpdate: Partial<UserSettings>,
  ): Promise<UserSettings> {
    // Buscar el user con settings
    const userAggregate = await this.userRepository.findById(userId);
    if (!userAggregate) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!userAggregate.settings) {
      throw new NotFoundException(`Settings for user ${userId} not found`);
    }

    // Merge de campos que vienen para update
    const currentSettings = userAggregate.settings;
    const updatedSettings = {
      ...currentSettings,
      ...settingsUpdate,
      updated_at: new Date(),
    };

    // Actualizar settings en repositorio
    const savedSettings = await this.userRepository.updateSettings(
      userId,
      updatedSettings,
    );

    return savedSettings;
  }
}
