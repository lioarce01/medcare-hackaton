import type React from "react"

import { SUBSCRIPTION_CONFIG } from "@/config/subscription"
import { toast } from "sonner"
import { useCreateCheckoutSession } from "@/hooks/useSubscription"
import { useUserProfile } from "@/hooks/useUser"
import {
  ActivitySquare,
  ArrowRight,
  BarChartBig,
  BellRing,
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  FileDown,
  Gift,
  Heart,
  Shield,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from "lucide-react"
import { useState } from "react"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  included: boolean
}

type PaymentProvider = "stripe" | "mercadopago"

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, included }) => (
  <div
    className={`group relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md ${included
      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30"
      : "border-border bg-muted/50 dark:bg-muted/30 hover:bg-accent/50"
      }`}
  >
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-md ${included ? "bg-emerald-500 dark:bg-emerald-600" : "bg-primary/20 dark:bg-primary/30"}`}>
            <Icon className={`w-4 h-4 ${included ? "text-white" : "text-primary"}`} />
          </div>
        </div>
        {included && (
          <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            ✅ Active
          </div>
        )}
      </div>
      <h3
        className={`font-semibold mb-2 text-sm ${included
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-foreground"
          }`}
      >
        {title}
      </h3>
      <p
        className={`text-xs leading-relaxed ${included
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground"
          }`}
      >
        {description}
      </p>
    </div>
  </div>
)

export const SubscriptionManager: React.FC = () => {
  const { data: user } = useUserProfile()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>("stripe")
  const createCheckoutSession = useCreateCheckoutSession()

  const isPremium = user?.subscription_status === "premium"
  const currentCurrency = selectedPaymentMethod === "mercadopago" ? "ARS" : "USD"
  const { symbol, amount } = SUBSCRIPTION_CONFIG.currency[currentCurrency]

  const priceId =
    selectedPaymentMethod === "mercadopago"
      ? SUBSCRIPTION_CONFIG.prices.mercadopago[currentCurrency]
      : SUBSCRIPTION_CONFIG.prices.stripe

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please log in to upgrade your subscription")
      return;
    }

    try {
      const checkoutData = {
        priceId: priceId,
        paymentProvider: selectedPaymentMethod,
        currency: currentCurrency,
        email: user.email,
      };

      await createCheckoutSession.mutateAsync(checkoutData);
    } catch (error) {
      // Error handling is done in the useCreateCheckoutSession hook
      console.error("Payment error:", error)
    }
  }

  const features = [
    {
      icon: BellRing,
      title: "Custom Reminders",
      description: "Create personalized medication reminders tailored to your schedule",
      included: !!(isPremium && user?.subscription_features?.customReminders),
      emoji: "⏰",
    },
    {
      icon: ActivitySquare,
      title: "Risk Predictions",
      description: "Receive insights on potential health risks based on your medication history",
      included: !!(isPremium && user?.subscription_features?.riskPredictions),
      emoji: "📉",
    },
    {
      icon: FileDown,
      title: "Data Export",
      description: "Download your medication logs and history for personal or medical use",
      included: !!(isPremium && user?.subscription_features?.dataExport),
      emoji: "📄",
    },
    {
      icon: BarChartBig,
      title: "Advanced Analytics",
      description: "Visualize trends and gain deep insights into your medication adherence",
      included: !!(isPremium && user?.subscription_features?.advancedAnalytics),
      emoji: "📊",
    },
  ];

  if (isPremium) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Premium Status Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Access to advanced features to better manage your medications
                </p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-semibold">✨ Premium</span>
            </div>
          </div>
        </div>

        {/* Subscription Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Subscription Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex space-x-2 items-center">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Active Premium</span>
                </div>
              </div>
              {user?.subscription_expires_at && (
                <div className="flex space-x-2 items-center">
                  <p className="text-sm text-muted-foreground mb-1">Expires on</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.subscription_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Health Benefits</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Advanced insights and analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Risk Predictions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Customizable reminders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Your Premium Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Thank You Message */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-3">🌟</div>
          <h3 className="text-xl font-bold mb-2">Thank you for being Premium!</h3>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-md mx-auto">
            Your investment in premium features helps you maintain better health habits and achieve your wellness goals.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Pricing Card */}
      <div className="bg-card border rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-lg p-6 mb-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Premium Plan</span>
            </div>
            <div className="flex items-baseline justify-center mb-3">
              <span className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                {symbol}
                {amount}
              </span>
              <span className="text-lg text-emerald-600 dark:text-emerald-400 ml-2">/month</span>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-2 rounded-lg text-sm font-semibold inline-block border border-emerald-200 dark:border-emerald-800">
              🎯 Best Value for Your Health
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">Choose Payment Method</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPaymentMethod("stripe")}
            disabled={createCheckoutSession.isPending}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 ${selectedPaymentMethod === "stripe"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-md"
              : "border-border hover:border-emerald-500 bg-card hover:bg-accent"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Stripe (Credit Card)</span>
            <span className="ml-2">💳</span>
          </button>

          <button
            onClick={() => setSelectedPaymentMethod("mercadopago")}
            disabled={createCheckoutSession.isPending}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 ${selectedPaymentMethod === "mercadopago"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-md"
              : "border-border hover:border-emerald-500 bg-card hover:bg-accent"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Wallet className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">MercadoPago (Only Argentina)</span>
            <span className="ml-2">💰</span>
          </button>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={createCheckoutSession.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
        >
          {createCheckoutSession.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Processing {selectedPaymentMethod === "stripe" ? "Stripe" : "MercadoPago"}...
            </>
          ) : (
            <>
              <Crown className="mr-3 w-5 h-5" />
              Upgrade to Premium
              <ArrowRight className="ml-3 w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Only {symbol}
            {amount}/month
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-3xl mb-3">🚀</div>
        <h3 className="text-xl font-bold mb-2">Invest in Your Health Journey!</h3>
        <p className="text-emerald-100 text-sm leading-relaxed max-w-lg mx-auto">
          Premium features help you stay consistent with your medications and achieve better health outcomes. Join
          thousands of users who've improved their wellness with our premium tools!
        </p>
      </div>
    </div>
  )
}
