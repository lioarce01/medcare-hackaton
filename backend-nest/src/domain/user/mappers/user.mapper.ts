import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { UserAggregate } from '../entities/user-aggregate.entity';

export class UserMapper {
  static toDomain(
    prismaUser: any,
    authUserId: string,
    prismaSettings?: any,
  ): UserAggregate {
    const user = new User(
      prismaUser.id,
      prismaUser.auth_user_id,
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

    return new UserAggregate(prismaUser.id, authUserId, user, settings);
  }
}
