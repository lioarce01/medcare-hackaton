import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

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
    if (isPremium) return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300';
    return 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300';
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card>
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
      <Card>
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
              enabled={features.basicReminders}
              label="Basic Reminders"
              limit={features.maxReminders}
            />
            <FeatureItem
              enabled={features.advancedAnalytics}
              label="Advanced Analytics"
              premium={!features.advancedAnalytics}
            />
            <FeatureItem
              enabled={features.exportData}
              label="Data Export"
              premium={!features.exportData}
            />
            <FeatureItem
              enabled={features.customReminders}
              label="Custom Reminders"
              premium={!features.customReminders}
            />
            <FeatureItem
              enabled={features.riskPredictions}
              label="Risk Predictions"
              premium={!features.riskPredictions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isPremium && (
        <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6 text-center">
            <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
            <p className="text-muted-foreground mb-4">
              Unlock unlimited medications, advanced analytics, and priority support
            </p>
            <Link to="/subscription" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Link>
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
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        {enabled ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Crown className="h-4 w-4 text-yellow-500" />
        )}
        <span className={`text-sm ${enabled ? '' : 'text-muted-foreground'}`}>
          {label}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {premium && !enabled && (
          <Badge variant="outline" className="text-xs">
            Premium
          </Badge>
        )}
        {limit !== undefined && limit !== -1 && (
          <span>Max {limit}</span>
        )}
        {limit === -1 && (
          <span>Unlimited</span>
        )}
      </div>
    </div>
  );
}
