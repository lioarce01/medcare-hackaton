import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, Zap } from 'lucide-react';
import { useSubscription, useFeatureAccess } from '@/hooks/useSubscription';
import { SubscriptionFeatures } from '@/services/subscription';

interface PremiumGuardProps {
  feature: keyof SubscriptionFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function PremiumGuard({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true 
}: PremiumGuardProps) {
  const hasAccess = useFeatureAccess(feature);
  const { isPremium, isOnTrial } = useSubscription();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

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

interface PremiumFeatureProps {
  feature: keyof SubscriptionFeatures;
  children: React.ReactNode;
  upgradeMessage?: string;
}

export function PremiumFeature({ 
  feature, 
  children, 
  upgradeMessage = "This feature requires a premium subscription" 
}: PremiumFeatureProps) {
  const hasAccess = useFeatureAccess(feature);

  if (!hasAccess) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-2">
            <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-xs">
              {upgradeMessage}
            </p>
            <Button size="sm" variant="outline">
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface LimitGuardProps {
  currentCount: number;
  maxCount: number;
  itemName: string;
  children: React.ReactNode;
  upgradeMessage?: string;
}

export function LimitGuard({ 
  currentCount, 
  maxCount, 
  itemName, 
  children, 
  upgradeMessage 
}: LimitGuardProps) {
  const { isPremium } = useSubscription();
  const isAtLimit = maxCount !== -1 && currentCount >= maxCount;

  if (!isAtLimit) {
    return <>{children}</>;
  }

  const defaultMessage = `You've reached the limit of ${maxCount} ${itemName}${maxCount !== 1 ? 's' : ''}. Upgrade to premium for unlimited access.`;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
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
