import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';
import { UserRepository } from 'src/domain/user/repositories/user.repository';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<UserAggregate> {
    const userAggregate = await this.userRepository.findById(id);
    if (!userAggregate) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return userAggregate;
  }
}
