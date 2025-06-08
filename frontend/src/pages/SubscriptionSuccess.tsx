import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

export const SubscriptionSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (status === 'approved' || sessionId || paymentId) {
      showToast('Subscription activated successfully!', 'success');
      // Redirect to subscription page after 3 seconds
      const timer = setTimeout(() => {
        navigate('/subscription');
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      navigate('/subscription');
    }
  }, [searchParams, navigate, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to our premium plan. Your account has been upgraded.
        </p>
        <div className="animate-pulse text-sm text-gray-500">
          Redirecting to subscription page...
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess; 