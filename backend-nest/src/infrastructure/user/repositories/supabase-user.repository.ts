import { Injectable } from '@nestjs/common';
import { UserAggregate } from 'src/domain/user/entities/user-aggregate.entity';
import { UserSettings } from 'src/domain/user/entities/user-settings.entity';
import { User } from 'src/domain/user/entities/user.entity';
import { UserMapper } from 'src/domain/user/mappers/user.mapper';
import { UserRepository } from 'src/domain/user/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getMyProfile(id: string): Promise<UserAggregate | null> {
    const prismaUser = await this.prisma.users.findUnique({ where: { id } });
    if (!prismaUser) return null;

    const prismaSettings = await this.prisma.user_settings.findUnique({
      where: { user_id: id },
    });

    // Como ahora `id` es el authUserId (del token), lo usamos directamente
    return UserMapper.toDomain(prismaUser, id, prismaSettings);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.users.findUnique({ where: { id } });
    if (!prismaUser) return null;

    return new User(
      prismaUser.id,
      prismaUser.id, // Using id as auth_user_id since auth_user_id doesn't exist in schema
      prismaUser.name,
      prismaUser.email,
      prismaUser.password,
      prismaUser.date_of_birth,
      prismaUser.gender,
      prismaUser.allergies,
      prismaUser.conditions,
      prismaUser.is_admin || false,
      prismaUser.phone_number,
      prismaUser.emergency_contact as any,
      prismaUser.created_at || undefined,
      prismaUser.updated_at || undefined,
      prismaUser.subscription_status,
      prismaUser.subscription_plan,
      prismaUser.subscription_expires_at,
      prismaUser.subscription_features as any,
    );
  }

  async update(userAggregate: UserAggregate): Promise<UserAggregate> {
    const { user, settings } = userAggregate;

    const updatedUser = await this.prisma.users.update({
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
        emergency_contact: user.emergency_contact as any,
        subscription_status: user.subscription_status,
        subscription_plan: user.subscription_plan,
        subscription_expires_at: user.subscription_expires_at,
        subscription_features: user.subscription_features as any,
      },
    });

    let updatedSettings: any = null;
    if (settings) {
      updatedSettings = await this.prisma.user_settings.update({
        where: { user_id: user.id },
        data: {
          email_enabled: settings.email_enabled,
          preferred_times: settings.preferred_times,
          timezone: settings.timezone,
          notification_preferences: settings.notification_preferences as any,
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
    await this.prisma.user_settings.deleteMany({
      where: { user_id: id },
    });

    await this.prisma.users.delete({
      where: { id },
    });
  }

  async updateSettings(
    userId: string,
    partialSettings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const updateData: any = { ...partialSettings, updated_at: new Date() };
    delete updateData.user_id; // Remove user_id from update data

    const updated = await this.prisma.user_settings.update({
      where: { user_id: userId },
      data: updateData,
    });

    return new UserSettings(
      updated.id,
      updated.user_id,
      updated.email_enabled,
      updated.preferred_times as string[],
      updated.timezone,
      updated.notification_preferences as any,
      updated.created_at || undefined,
      updated.updated_at || undefined,
    );
  }

  // Methods for cron jobs
  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.users.findMany({
        orderBy: { created_at: 'desc' },
      });

      return users.map(
        (user) =>
          new User(
            user.id,
            user.id, // Using id as auth_user_id since auth_user_id doesn't exist in schema
            user.name,
            user.email,
            user.password,
            user.date_of_birth,
            user.gender,
            user.allergies,
            user.conditions,
            user.is_admin || false,
            user.phone_number,
            user.emergency_contact as any,
            user.created_at || undefined,
            user.updated_at || undefined,
            user.subscription_status,
            user.subscription_plan,
            user.subscription_expires_at,
            user.subscription_features as any,
          ),
      );
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  async findUsersWithEmailNotifications(): Promise<User[]> {
    try {
      // Get users with email notifications enabled in their settings
      const usersWithSettings = await this.prisma.users.findMany({
        include: {
          user_settings: true,
        },
        where: {
          user_settings: {
            email_enabled: true,
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return usersWithSettings.map(
        (user) =>
          new User(
            user.id,
            user.id, // Using id as auth_user_id since auth_user_id doesn't exist in schema
            user.name,
            user.email,
            user.password,
            user.date_of_birth,
            user.gender,
            user.allergies,
            user.conditions,
            user.is_admin || false,
            user.phone_number,
            user.emergency_contact as any,
            user.created_at || undefined,
            user.updated_at || undefined,
            user.subscription_status,
            user.subscription_plan,
            user.subscription_expires_at,
            user.subscription_features as any,
          ),
      );
    } catch (error) {
      console.error('Error finding users with email notifications:', error);
      throw error;
    }
  }
}
