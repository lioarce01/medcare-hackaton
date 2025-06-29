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
    public advanced_analytics: boolean = false,
    public data_export: boolean = false,
    public custom_reminders: boolean = false,
    public risk_predictions: boolean = false,
  ) { }

  static createPremiumFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(true, true, true, true);
  }

  static createFreeFeatures(): SubscriptionFeatures {
    return new SubscriptionFeatures(
      false,
      false,
      false,
      false,
    );
  }

  static fromJson(json: any): SubscriptionFeatures {
    return new SubscriptionFeatures(
      json.advanced_analytics || false,
      json.data_export || false,
      json.custom_reminders || false,
      json.risk_predictions || false,
    );
  }

  toJson(): Record<string, boolean> {
    return {
      advanced_analytics: this.advanced_analytics,
      data_export: this.data_export,
      custom_reminders: this.custom_reminders,
      risk_predictions: this.risk_predictions,
    };
  }
}
