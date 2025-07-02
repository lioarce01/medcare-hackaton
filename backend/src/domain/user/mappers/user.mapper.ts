import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { UserAggregate } from '../entities/user-aggregate.entity';

export class UserMapper {
  static toDomain(
    prismaUser: any,
    authUserId: string,
    prismaSettings?: any,
  ): UserAggregate {
    // Debug logging
    console.log('UserMapper.toDomain called with:', {
      prismaUser: prismaUser ? {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name
      } : null,
      authUserId,
      hasSettings: !!prismaSettings
    });

    const user = new User(
      prismaUser.id,
      prismaUser.id, // Use the same id since auth_user_id doesn't exist in schema
      prismaUser.name,
      prismaUser.email,
      prismaUser.password,
      prismaUser.date_of_birth,
      prismaUser.gender,
      prismaUser.allergies,
      prismaUser.conditions,
      prismaUser.is_admin,
      prismaUser.phone_number,
      prismaUser.emergency_contact,
      prismaUser.created_at,
      prismaUser.updated_at,
      prismaUser.subscription_status,
      prismaUser.subscription_plan,
      prismaUser.subscription_expires_at,
      prismaUser.subscription_features,
    );

    const settings = prismaSettings
      ? new UserSettings(
        prismaSettings.id,
        prismaSettings.user_id,
        prismaSettings.email_enabled,
        prismaSettings.preferred_times,
        prismaSettings.timezone,
        prismaSettings.notification_preferences,
        prismaSettings.created_at,
        prismaSettings.updated_at,
      )
      : null;

    const userAggregate = new UserAggregate(prismaUser.id, authUserId, user, settings);

    // Debug logging
    console.log('UserAggregate created:', {
      id: userAggregate.id,
      authUserId: userAggregate.authUserId,
      hasUser: !!userAggregate.user,
      userEmail: userAggregate.user?.email,
      hasSettings: !!userAggregate.settings
    });

    return userAggregate;
  }
}
