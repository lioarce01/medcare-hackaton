import { CheckCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "sonner"
import { verifyStripeSession } from '../api/subscriptions';

export const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    const handleSuccess = async () => {
      if (sessionId) {
        // Verify Stripe session with backend
        try {
          await verifyStripeSession(sessionId);
          toast.success('Subscription activated successfully!');
        } catch (error) {
          console.error('Error verifying session:', error);
          toast.error('Error activating subscription. Please contact support.');
        }
      } else if (status === 'approved' || paymentId) {
        // Handle MercadoPago or other payment providers
        toast.success('Subscription activated successfully!');
      } else {
        navigate('/subscription');
        return;
      }

      // Redirect to subscription page after 3 seconds
      const timer = setTimeout(() => {
        navigate('/subscription');
      }, 3000);

      return () => clearTimeout(timer);
    };

    handleSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center" >
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl text-center" >
        <div className="mb-6" >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        < h1 className="text-2xl font-bold text-gray-900 mb-4" >
          Payment Successful!
        </h1>
        < p className="text-gray-600 mb-6" >
          Thank you for subscribing to our premium plan. Your account has been upgraded.
        </p>
        < div className="animate-pulse text-sm text-gray-500" >
          Redirecting to subscription page...
        </div>
      </div>
    </div>
  )
};

export default SubscriptionSuccess; 