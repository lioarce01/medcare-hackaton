import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/user/repositories/user.repository';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(userAggregate: UserAggregate): Promise<UserAggregate> {
    // Validar que exista el usuario (opcional)
    const existingUser = await this.userRepository.getMyProfile(
      userAggregate.id,
    );
    if (!existingUser) {
      throw new NotFoundException(`User with id ${userAggregate.id} not found`);
    }

    // Actualizar el usuario
    const updatedUser = await this.userRepository.update(userAggregate);
    return updatedUser;
  }
}
