import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user/repositories/user.repository';
import { User } from '../../domain/user/entities/user.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const saved = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
      },
    });
    return new User(saved.id, saved.name, saved.email);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) return null;
    return new User(found.id, found.name, found.email);
  }
}
