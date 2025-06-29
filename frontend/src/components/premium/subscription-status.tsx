import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  CheckCircle,
  Zap,
  Sparkles,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SubscriptionStatus() {
  const {
    isPremium,
    statusText,
    plan,
    features
  } = useSubscription();

  const getStatusIcon = () => {
    if (isPremium) return <Crown className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusColor = () => {
    if (isPremium) return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-300 dark:border-yellow-700';
    return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">{statusText}</CardTitle>
            </div>
            <Badge className={getStatusColor()}>
              {plan.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Feature Summary */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your Plan Features</CardTitle>
          <CardDescription>
            {isPremium
              ? 'You have access to all premium features'
              : 'Upgrade to unlock more features'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureItem
              enabled={features.medications}
              label="Medication Tracking"
              limit={features.maxMedications}
            />
            <FeatureItem
              enabled={features.basic_reminders}
              label="Basic Reminders"
              limit={features.maxReminders}
            />
            <FeatureItem
              enabled={features.advanced_analytics}
              label="Advanced Analytics"
              premium={!features.advanced_analytics}
            />
            <FeatureItem
              enabled={features.data_export}
              label="Data Export"
              premium={!features.data_export}
            />
            <FeatureItem
              enabled={features.custom_reminders}
              label="Custom Reminders"
              premium={!features.custom_reminders}
            />
            <FeatureItem
              enabled={features.risk_predictions}
              label="Risk Predictions"
              premium={!features.risk_predictions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isPremium && (
        <Card className="relative overflow-hidden border light:text-gray-800 dark:text-white shadow-sm to-black dark:bg-muted-80">
          <CardHeader className="">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Unlock Premium Features
                </CardTitle>
                <CardDescription className="text-base text-gray-500">
                  Take your medication management to the next level
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8 text-center">
            <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              Get advanced analytics, unlimited tracking, and personalized insights to better manage your health
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 dark:bg-muted/30 border-border hover:bg-accent/50">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 dark:bg-muted/30 border-border hover:bg-accent/50">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Unlimited Tracking</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 dark:bg-muted/30 border-border hover:bg-accent/50">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Priority Support</span>
              </div>
            </div>

            <Link to="/subscription">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <p className="text-xs text-gray-400 mt-4">
              Only $9.99/month • Cancel anytime
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FeatureItemProps {
  enabled: boolean;
  label: string;
  limit?: number;
  premium?: boolean;
}

function FeatureItem({ enabled, label, limit, premium }: FeatureItemProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${enabled
      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
      : 'bg-muted/50 dark:bg-muted/30 border-border hover:bg-accent/50'
      }`}>
      <div className="flex items-center gap-3">
        {enabled ? (
          <div className="p-1.5 bg-emerald-500 dark:bg-emerald-600 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 text-white" />
          </div>
        ) : (
          <div className="p-1.5 bg-primary/20 dark:bg-primary/30 rounded-md">
            <Crown className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
        <span className={`text-sm font-medium ${enabled
          ? 'text-emerald-700 dark:text-emerald-300'
          : 'text-muted-foreground'
          }`}>
          {label}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {premium && !enabled && (
          <Badge variant="outline" className="text-xs border-primary/50 text-primary">
            Premium
          </Badge>
        )}
        {limit !== undefined && limit !== -1 && (
          <span className="text-xs">Max {limit}</span>
        )}
        {limit === -1 && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Unlimited</span>
        )}
      </div>
    </div>
  );
}
