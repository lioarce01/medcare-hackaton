import { UserAggregate } from '../entities/user-aggregate.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { User } from '../entities/user.entity';

export interface UserRepository {
  // Obtiene el aggregate completo (User + Settings)
  getMyProfile(id: string): Promise<UserAggregate | null>;

  // Obtiene solo la información básica del usuario (para reminders, etc.)
  findById(id: string): Promise<User | null>;

  // Actualiza el aggregate completo
  update(userAggregate: UserAggregate): Promise<UserAggregate>;

  // Borra al usuario y su configuración (cascade)
  delete(id: string): Promise<void>;

  // Actualiza solo las settings asociadas al user
  updateSettings(
    userId: string,
    settings: Partial<UserSettings>,
  ): Promise<UserSettings>;

  // Methods for cron jobs
  findAll(): Promise<User[]>;
  findUsersWithEmailNotifications(): Promise<User[]>;
}
