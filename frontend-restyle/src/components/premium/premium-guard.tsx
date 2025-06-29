import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, Zap } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useSubscription';
import { SubscriptionFeatures } from '@/services/subscription';

interface PremiumGuardProps {
  feature: keyof SubscriptionFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function LimitGuard({
  currentCount,
  maxCount,
  itemName,
  children,
  upgradeMessage,
}: {
  currentCount: number;
  maxCount: number;
  itemName: string;
  children: React.ReactNode;
  upgradeMessage?: string;
}) {
  const isAtLimit = maxCount !== -1 && currentCount >= maxCount;

  if (!isAtLimit) {
    return <>{children}</>;
  }

  const defaultMessage = `You've reached the limit of ${maxCount} ${itemName}${maxCount !== 1 ? 's' : ''}. Upgrade to premium for unlimited access.`;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="flex items-center justify-center">
          <Lock className="h-8 w-8 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Limit Reached</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {upgradeMessage || defaultMessage}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline">
              {currentCount} / {maxCount} {itemName}s
            </Badge>
          </div>
          <Button className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export function PremiumGuard({
  feature,
  children,
  fallback,
  showUpgrade = true
}: PremiumGuardProps) {
  const hasAccess = useFeatureAccess(feature);

  if (hasAccess) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (!showUpgrade) return null;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          Premium Feature
        </CardTitle>
        <CardDescription>
          Upgrade to unlock this feature and get access to advanced functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium Only
          </Badge>
        </div>
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
          <Zap className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
}
