import { UserAggregate } from '../entities/user-aggregate.entity';

export class UserPresenter {
  static toHttp(aggregate: UserAggregate) {
    const { id, auth_user_id, ...userWithoutId } = UserPresenter.toUserJson(
      aggregate.user,
    );

    return {
      id: aggregate.id,
      authUserId: auth_user_id,
      ...userWithoutId,
      settings: aggregate.settings
        ? UserPresenter.toSettingsJson(aggregate.settings)
        : null,
    };
  }

  static toUserJson(user: any) {
    return {
      id: user.id,
      auth_user_id: user.auth_user_id,
      name: user.name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      allergies: user.allergies,
      conditions: user.conditions,
      is_admin: user.is_admin,
      phone_number: user.phone_number,
      emergency_contact: user.emergency_contact,
      created_at: user.created_at,
      updated_at: user.updated_at,
      subscription_status: user.subscription_status,
      subscription_plan: user.subscription_plan,
      subscription_expires_at: user.subscription_expires_at,
      subscription_features: user.subscription_features,
    };
  }

  static toSettingsJson(settings: any) {
    return {
      id: settings.id,
      user_id: settings.user_id,
      email_enabled: settings.email_enabled,
      preferred_times: settings.preferred_times,
      timezone: settings.timezone,
      notification_preferences: settings.notification_preferences,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    };
  }
}
