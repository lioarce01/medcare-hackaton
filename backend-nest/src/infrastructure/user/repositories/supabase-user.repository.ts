import { Injectable } from '@nestjs/common';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';
import { UserSettings } from 'src/domain/user/entities/user-settings.entity';
import { User } from 'src/domain/user/entities/user.entity';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';
import { UserRepository } from 'src/domain/user/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string): Promise<UserAggregate | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    if (!prismaUser) return null;

    const authUser = await this.prisma.$queryRawUnsafe(
      `SELECT id FROM auth.users WHERE email = $1 LIMIT 1`,
      prismaUser.email,
    );
    const authUserId = authUser?.[0]?.id ?? '';

    const prismaSettings = await this.prisma.user_settings.findUnique({
      where: { user_id: id },
    });

    return UserMapper.toDomain(prismaUser, authUserId, prismaSettings);
  }

  async update(userAggregate: UserAggregate): Promise<UserAggregate> {
    const { user, settings } = userAggregate;

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        allergies: user.allergies ?? [],
        conditions: user.conditions ?? [],
        is_admin: user.is_admin,
        phone_number: user.phone_number,
        emergency_contact: user.emergency_contact,
        subscription_status: user.subscription_status,
        subscription_plan: user.subscription_plan,
        subscription_expires_at: user.subscription_expires_at,
        subscription_features: user.subscription_features,
      },
    });

    let updatedSettings = null;
    if (settings) {
      updatedSettings = await this.prisma.userSettings.update({
        where: { user_id: user.id },
        data: {
          email_enabled: settings.email_enabled,
          preferred_times: settings.preferred_times,
          timezone: settings.timezone,
          notification_preferences: settings.notification_preferences,
        },
      });
    }

    return UserMapper.toDomain(
      updatedUser,
      userAggregate.authUserId,
      updatedSettings,
    );
  }

  async delete(id: string): Promise<void> {
    // Primero eliminar settings si existen (relación 1:1)
    await this.prisma.userSettings.deleteMany({
      where: { user_id: id },
    });

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateSettings(
    userId: string,
    partialSettings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const updated = await this.prisma.userSettings.update({
      where: { user_id: userId },
      data: {
        ...partialSettings,
        updated_at: new Date(),
      },
    });

    return new UserSettings(
      updated.id,
      updated.user_id,
      updated.email_enabled,
      updated.preferred_times,
      updated.timezone,
      updated.notification_preferences,
      updated.created_at,
      updated.updated_at,
    );
  }
}
