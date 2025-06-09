export class SubscriptionStatusDto {
  status: string;
  plan: string;
  expiresAt: string | null;
  features: Record<string, boolean>;
  isActive: boolean;
  isPremium: boolean;
}
