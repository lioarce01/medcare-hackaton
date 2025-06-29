import { User } from './user.entity';
import { UserSettings } from './user-settings.entity';

export class UserAggregate {
  constructor(
    public readonly id: string, // referencia a public.users.id
    public readonly authUserId: string, // opcional si quieres vincular con auth.users
    public user: User,
    public settings: UserSettings | null = null,
  ) {}

  // Ejemplo: lógica de dominio
  updateProfile(name: string, email: string | null) {
    this.user.name = name;
    this.user.email = email;
    this.user.updated_at = new Date();
  }

  enableEmailNotifications() {
    if (this.settings) {
      this.settings.email_enabled = true;
      this.settings.updated_at = new Date();
    }
  }

  disablePushNotifications() {
    if (this.settings?.notification_preferences) {
      this.settings.notification_preferences.push = false;
      this.settings.updated_at = new Date();
    }
  }

  updatePreferredTimes(times: string[]) {
    if (this.settings) {
      this.settings.preferred_times = times;
      this.settings.updated_at = new Date();
    }
  }

  updateEmergencyContact(contact: {
    name: string;
    phone_number: string;
    relationship: string;
  }) {
    this.user.emergency_contact = contact;
    this.user.updated_at = new Date();
  }
}
