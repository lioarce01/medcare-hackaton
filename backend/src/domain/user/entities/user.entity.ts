export class User {
  constructor(
    public readonly id: string,
    public auth_user_id: string,
    public name: string | null,
    public email: string | null,
    public password?: string | null,
    public date_of_birth?: string | null,
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
      data_export: false,
      basic_reminders: true,
      custom_reminders: false,
      risk_predictions: false,
      advanced_analytics: false,
      medication_tracking: true
    } | null,
  ) { }
}
