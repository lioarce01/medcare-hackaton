import React from 'react';
import { SubscriptionManager } from '../components/SubscriptionManager';
import { useTranslation } from 'react-i18next';

export const Subscription: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('subscription.upgrade.title')}
        </h1>
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Subscription; 