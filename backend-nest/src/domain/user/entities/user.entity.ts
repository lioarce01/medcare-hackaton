export class User {
  constructor(
    public readonly id: string,
    public auth_user_id: string,
    public name: string | null,
    public email: string | null,
    public password?: string | null,
    public date_of_birth?: Date | null,
    public gender?: string | null,
    public allergies?: string[] | null,
    public conditions?: string[] | null,
    public is_admin: boolean = false,
    public phone_number?: string | null,
    public emergency_contact?: {
      name: string;
      phone_number: string;
      relationship: string;
    } | null,
    public created_at?: Date,
    public updated_at?: Date,
    public subscription_status?: string | null,
    public subscription_plan?: string | null,
    public subscription_expires_at?: Date | null,
    public subscription_features?: {
      custom_reminders: boolean;
      custom_notifications: boolean;
      risk_analytics: boolean;
    } | null,
  ) {}
}
