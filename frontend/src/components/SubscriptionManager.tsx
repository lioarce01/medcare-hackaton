import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, MessageSquare, Star, Users } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useToast } from './Toast';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  included: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, included }) => (
  <div className={`p-4 rounded-xl border ${included ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-lg ${included ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${included ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
      <div>
        <h3 className={`font-medium ${included ? 'text-blue-900' : 'text-gray-700'}`}>{title}</h3>
        <p className={`text-sm ${included ? 'text-blue-700' : 'text-gray-500'}`}>{description}</p>
      </div>
    </div>
  </div>
);

export const SubscriptionManager: React.FC = () => {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const { showToast } = useToast();

  const isPremium = user?.subscription?.status === 'premium';

  const handleUpgrade = async () => {
    try {
      // TODO: Implement Stripe checkout
      showToast('Coming soon!', 'info');
    } catch (error) {
      showToast('Failed to process payment', 'error');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: t('subscription.features.sms.title'),
      description: t('subscription.features.sms.description'),
      included: isPremium
    },
    {
      icon: Bell,
      title: t('subscription.features.sounds.title'),
      description: t('subscription.features.sounds.description'),
      included: isPremium
    },
    {
      icon: Star,
      title: t('subscription.features.priority.title'),
      description: t('subscription.features.priority.description'),
      included: isPremium
    },
    {
      icon: Users,
      title: t('subscription.features.family.title'),
      description: t('subscription.features.family.description'),
      included: isPremium
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPremium ? t('subscription.premium.title') : t('subscription.upgrade.title')}
        </h2>
        <p className="text-gray-600">
          {isPremium ? t('subscription.premium.description') : t('subscription.upgrade.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {!isPremium && (
        <div className="text-center">
          <button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            {t('subscription.upgrade.button')}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {t('subscription.upgrade.price')}
          </p>
        </div>
      )}
    </div>
  );
}; 