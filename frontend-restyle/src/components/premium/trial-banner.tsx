import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Clock, 
  AlertTriangle, 
  Crown, 
  X,
  Zap
} from 'lucide-react';
import { useTrialStatus, useSubscription } from '@/hooks/useSubscription';

interface TrialBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function TrialBanner({ onDismiss, showDismiss = false }: TrialBannerProps) {
  const { isOnTrial, daysRemaining, isExpiringSoon, hasExpired } = useTrialStatus();
  const { isPremium } = useSubscription();

  // Don't show banner if user is premium or not on trial
  if (isPremium || (!isOnTrial && !hasExpired)) {
    return null;
  }

  const getBannerVariant = () => {
    if (hasExpired) return 'destructive';
    if (isExpiringSoon) return 'default';
    return 'default';
  };

  const getBannerContent = () => {
    if (hasExpired) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Trial Expired',
        message: 'Your free trial has ended. Upgrade to premium to continue using advanced features.',
        buttonText: 'Upgrade Now',
        buttonIcon: <Crown className="h-4 w-4" />,
        urgent: true,
      };
    }

    if (isExpiringSoon) {
      return {
        icon: <Clock className="h-4 w-4" />,
        title: 'Trial Ending Soon',
        message: `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial. Upgrade now to keep your premium features.`,
        buttonText: 'Upgrade to Premium',
        buttonIcon: <Zap className="h-4 w-4" />,
        urgent: true,
      };
    }

    return {
      icon: <Gift className="h-4 w-4" />,
      title: 'Free Trial Active',
      message: `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining in your premium trial. Enjoying the features?`,
      buttonText: 'Upgrade Early',
      buttonIcon: <Crown className="h-4 w-4" />,
      urgent: false,
    };
  };

  const content = getBannerContent();

  return (
    <Alert 
      variant={getBannerVariant()} 
      className={`relative ${content.urgent ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1">
          <div className={content.urgent ? 'text-orange-600' : 'text-blue-600'}>
            {content.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm ${content.urgent ? 'text-orange-800' : 'text-blue-800'}`}>
                {content.title}
              </span>
              {isOnTrial && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${content.urgent ? 'border-orange-300 text-orange-700' : 'border-blue-300 text-blue-700'}`}
                >
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                </Badge>
              )}
            </div>
            <AlertDescription className={content.urgent ? 'text-orange-700' : 'text-blue-700'}>
              {content.message}
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            className={
              content.urgent 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            {content.buttonIcon}
            <span className="ml-1">{content.buttonText}</span>
          </Button>
          
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={`p-1 h-auto ${content.urgent ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

// Compact version for header/navbar
export function TrialBannerCompact() {
  const { isOnTrial, daysRemaining, isExpiringSoon, hasExpired } = useTrialStatus();
  const { isPremium } = useSubscription();

  if (isPremium || (!isOnTrial && !hasExpired)) {
    return null;
  }

  if (hasExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Trial expired - Upgrade to continue</span>
          <Button size="sm" variant="secondary" className="ml-2 h-6 text-xs">
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-orange-600 text-white px-4 py-2 text-center text-sm">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in trial</span>
          <Button size="sm" variant="secondary" className="ml-2 h-6 text-xs">
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <Gift className="h-4 w-4" />
        <span>Premium trial - {daysRemaining} days left</span>
      </div>
    </div>
  );
}
