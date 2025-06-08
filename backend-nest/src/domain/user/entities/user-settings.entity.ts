export class UserSettings {
  constructor(
    public readonly id: string,
    public user_id: string,
    public email_enabled: boolean,
    public preferred_times: string[],
    public timezone: string,
    public notification_preferences?: {
      email: boolean;
      push: boolean;
    } | null,
    public created_at?: Date,
    public updated_at?: Date,
  ) {}
}
