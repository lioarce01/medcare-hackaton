import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/user/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const userAggregate = await this.userRepository.findById(id);
    if (!userAggregate) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.delete(id);
  }
}
