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
  ) {}

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
    public smsReminders: boolean = false,
    public customSounds: boolean = false,
    public priorityNotifications: boolean = false,
    public familyNotifications: boolean = false,
    public weeklyReports: boolean = false,
    public advancedAnalytics: boolean = false,
    public riskScoring: boolean = false,
  ) {}

  static createPremiumFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(true, true, true, true, true, true, true);
  }

  static createFreeFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    );
  }

  static fromJson(json: any): SubscriptionFeatures {
    return new SubscriptionFeatures(
      json.smsReminders || false,
      json.customSounds || false,
      json.priorityNotifications || false,
      json.familyNotifications || false,
      json.weeklyReports || false,
      json.advancedAnalytics || false,
      json.riskScoring || false,
    );
  }

  toJson(): Record<string, boolean> {
    return {
      smsReminders: this.smsReminders,
      customSounds: this.customSounds,
      priorityNotifications: this.priorityNotifications,
      familyNotifications: this.familyNotifications,
    };
  }
}
