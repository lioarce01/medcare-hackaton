export class Subscription {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: SubscriptionStatus,
    public plan: SubscriptionPlan,
    public expiresAt: Date | null,
    public features: SubscriptionFeatures,
    public paymentProviderId?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) { }

  isActive(): boolean {
    return (
      this.status === SubscriptionStatus.PREMIUM &&
      this.expiresAt !== null &&
      this.expiresAt > new Date()
    );
  }

  isPremium(): boolean {
    return this.plan === SubscriptionPlan.PREMIUM && this.isActive();
  }

  hasFeature(feature: keyof SubscriptionFeatures): boolean {
    return this.isPremium() && this.features[feature] === true;
  }

  updateToPremium(expirationDate: Date, paymentProviderId?: string): void {
    this.status = SubscriptionStatus.PREMIUM;
    this.plan = SubscriptionPlan.PREMIUM;
    this.expiresAt = expirationDate;
    this.paymentProviderId = paymentProviderId;
    this.features = SubscriptionFeatures.createPremiumFeatures();
    this.updatedAt = new Date();
  }

  downgradeToFree(): void {
    this.status = SubscriptionStatus.FREE;
    this.plan = SubscriptionPlan.FREE;
    this.expiresAt = null;
    this.paymentProviderId = null;
    this.features = SubscriptionFeatures.createFreeFeatures();
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt <= new Date();
  }
}

export enum SubscriptionStatus {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export class SubscriptionFeatures {
  constructor(
    // Core features
    public medications: boolean = true,
    public basic_reminders: boolean = true,
    public adherence_tracking: boolean = true,

    // Premium features
    public advanced_analytics: boolean = false,
    public data_export: boolean = false,
    public custom_reminders: boolean = false,
    public unlimited_medications: boolean = false,
    public risk_predictions: boolean = false,
    public weekly_reports: boolean = false,

    // Limits
    public maxMedications: number = 3,
    public maxReminders: number = 10,
    public maxFamilyMembers: number = 0,
  ) { }

  static createPremiumFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(
      // Core features
      true, // medications
      true, // basic_reminders
      true, // adherence_tracking

      // Premium features
      true, // advanced_analytics
      true, // data_export
      true, // custom_reminders
      true, // unlimited_medications
      true, // risk_predictions
      true, // weekly_reports

      // Limits
      -1, // maxMedications (unlimited)
      -1, // maxReminders (unlimited)
      0,  // maxFamilyMembers
    );
  }

  static createFreeFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(
      // Core features
      true, // medications
      true, // basic_reminders
      true, // adherence_tracking

      // Premium features
      false, // advanced_analytics
      false, // data_export
      false, // custom_reminders
      false, // unlimited_medications
      false, // risk_predictions
      false, // weekly_reports

      // Limits
      3,  // maxMedications
      10, // maxReminders
      0,  // maxFamilyMembers
    );
  }

  static fromJson(json: any): SubscriptionFeatures {
    return new SubscriptionFeatures(
      // Core features
      json.medications ?? true,
      json.basic_reminders ?? true,
      json.adherence_tracking ?? true,

      // Premium features
      json.advanced_analytics ?? false,
      json.data_export ?? false,
      json.custom_reminders ?? false,
      json.unlimited_medications ?? false,
      json.risk_predictions ?? false,
      json.weekly_reports ?? false,

      // Limits
      json.maxMedications ?? 3,
      json.maxReminders ?? 10,
      json.maxFamilyMembers ?? 0,
    );
  }

  toJson(): Record<string, any> {
    return {
      // Core features
      medications: this.medications,
      basic_reminders: this.basic_reminders,
      adherence_tracking: this.adherence_tracking,

      // Premium features
      advanced_analytics: this.advanced_analytics,
      data_export: this.data_export,
      custom_reminders: this.custom_reminders,
      unlimited_medications: this.unlimited_medications,
      risk_predictions: this.risk_predictions,
      weekly_reports: this.weekly_reports,

      // Limits
      maxMedications: this.maxMedications,
      maxReminders: this.maxReminders,
      maxFamilyMembers: this.maxFamilyMembers,
    };
  }
}
