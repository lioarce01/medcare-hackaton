import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bell, Star, Users, CreditCard, Wallet } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useToast } from './Toast';
import { useCreateCheckoutSession } from '../api/subscriptions';
import { SUBSCRIPTION_CONFIG } from '../config/subscription';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  included: boolean;
}

type PaymentProvider = 'stripe' | 'mercadopago';

interface CheckoutSessionResponse {
  url?: string;
  preferenceId?: string;
  initPoint?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, included }) => (
  <div className={`p-6 rounded-lg border ${included ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
    <div className="flex items-center mb-4">
      <Icon className={`w-6 h-6 mr-3 ${included ? 'text-blue-500' : 'text-gray-400'}`} />
      <h3 className={`text-lg font-medium ${included ? 'text-blue-700' : 'text-gray-900'}`}>{title}</h3>
    </div>
    <p className={`text-sm ${included ? 'text-blue-600' : 'text-gray-500'}`}>{description}</p>
  </div>
);

export const SubscriptionManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: user } = useUser();
  const { showToast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>('stripe');
  const createCheckoutSession = useCreateCheckoutSession();

  const isPremium = user?.subscription_status === 'premium';
  const currentCurrency = i18n.language === 'pt' ? 'BRL' : i18n.language === 'cn' ? 'CNY' : i18n.language === "es" ? 'ARS' : 'USD';
  const { symbol, amount } = SUBSCRIPTION_CONFIG.currency[currentCurrency];

  const handleUpgrade = async () => {
    try {
      const response = await createCheckoutSession.mutateAsync({
        priceId: selectedPaymentMethod === 'mercadopago' 
          ? SUBSCRIPTION_CONFIG.prices.mercadopago[currentCurrency]
          : SUBSCRIPTION_CONFIG.prices.stripe,
        paymentProvider: selectedPaymentMethod,
        currency: currentCurrency,
        email: user?.email
      });

      const redirectUrl = response.url || response.initPoint;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      showToast(errorMessage, 'error');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: t('subscription.features.sms.title'),
      description: t('subscription.features.sms.description'),
      included: !!(isPremium && user?.subscription_features?.smsReminders)
    },
    {
      icon: Bell,
      title: t('subscription.features.sounds.title'),
      description: t('subscription.features.sounds.description'),
      included: !!(isPremium && user?.subscription_features?.customSounds)
    },
    {
      icon: Star,
      title: t('subscription.features.priority.title'),
      description: t('subscription.features.priority.description'),
      included: !!(isPremium && user?.subscription_features?.priorityNotifications)
    },
    {
      icon: Users,
      title: t('subscription.features.family.title'),
      description: t('subscription.features.family.description'),
      included: !!(isPremium && user?.subscription_features?.familyNotifications)
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
        {isPremium && user?.subscription_expires_at && (
          <p className="text-sm text-gray-500 mt-2">
            Your subscription expires on {new Date(user.subscription_expires_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {!isPremium && (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('subscription.upgrade.payment_methods.title')}</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedPaymentMethod('stripe')}
                disabled={createCheckoutSession.isPending}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  selectedPaymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {t('subscription.upgrade.payment_methods.stripe')}
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('mercadopago')}
                disabled={createCheckoutSession.isPending}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  selectedPaymentMethod === 'mercadopago'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {t('subscription.upgrade.payment_methods.mercadopago')}
              </button>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={createCheckoutSession.isPending}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createCheckoutSession.isPending 
              ? `${t('subscription.upgrade.processing')} ${selectedPaymentMethod === 'stripe' ? 'Stripe' : 'MercadoPago'}...`
              : t('subscription.upgrade.button')}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {t('subscription.upgrade.price', { symbol, amount })}
          </p>
        </div>
      )}
    </div>
  );
}; 