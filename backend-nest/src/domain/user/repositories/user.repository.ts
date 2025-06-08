import { UserAggregate } from '../entities/user-aggregate.entity';
import { UserSettings } from '../entities/user-settings.entity';

export interface UserRepository {
  // Obtiene el aggregate completo (User + Settings)
  findById(id: string): Promise<UserAggregate | null>;

  // Actualiza el aggregate completo
  update(userAggregate: UserAggregate): Promise<UserAggregate>;

  // Borra al usuario y su configuración (cascade)
  delete(id: string): Promise<void>;

  // Actualiza solo las settings asociadas al user
  updateSettings(
    userId: string,
    settings: Partial<UserSettings>,
  ): Promise<UserSettings>;
}
