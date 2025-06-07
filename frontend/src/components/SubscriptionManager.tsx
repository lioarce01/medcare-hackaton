"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Star,
  Users,
  CreditCard,
  Wallet,
  Crown,
  CheckCircle,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Gift,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react"
import { useUser } from "../hooks/useUser"
import { useToast } from "./Toast"
import { useCreateCheckoutSession } from "../api/subscriptions"
import { SUBSCRIPTION_CONFIG } from "../config/subscription"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  included: boolean
  emoji: string
}

type PaymentProvider = "stripe" | "mercadopago"

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, included, emoji }) => (
  <div
    className={`group relative overflow-hidden rounded-xl shadow-md border transition-all duration-300 transform hover:-translate-y-1 ${
      included
        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg"
        : "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg"
    }`}
  >
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-lg shadow-sm ${
              included
                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl">{emoji}</span>
        </div>
        {included && (
          <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
            ✅ Active
          </div>
        )}
      </div>
      <h3 className={`font-bold mb-2 text-sm ${included ? "text-emerald-700" : "text-purple-700"}`}>{title}</h3>
      <p className={`text-xs ${included ? "text-emerald-600" : "text-purple-600"}`}>{description}</p>
    </div>
  </div>
)

export const SubscriptionManager: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { data: user } = useUser()
  const { showToast } = useToast()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>("stripe")
  const createCheckoutSession = useCreateCheckoutSession()

  const isPremium = user?.subscription_status === "premium"
  const currentCurrency =
    i18n.language === "pt" ? "BRL" : i18n.language === "cn" ? "CNY" : i18n.language === "es" ? "ARS" : "USD"
  const { symbol, amount } = SUBSCRIPTION_CONFIG.currency[currentCurrency]

  const handleUpgrade = async () => {
    try {
      const response = await createCheckoutSession.mutateAsync({
        priceId:
          selectedPaymentMethod === "mercadopago"
            ? SUBSCRIPTION_CONFIG.prices.mercadopago[currentCurrency]
            : SUBSCRIPTION_CONFIG.prices.stripe,
        paymentProvider: selectedPaymentMethod,
        currency: currentCurrency,
        email: user?.email,
      })

      const redirectUrl = response.url || response.initPoint
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error("Payment error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process payment"
      showToast(errorMessage, "error")
    }
  }

  const features = [
    // {
    //   icon: Bell,
    //   title: "Custom Reminders",
    //   description: "Create personalized reminder schedules that fit your lifestyle",
    //   included: !!(isPremium && user?.subscription_features?.customReminders),
    //   emoji: "⏰",
    // },
    // {
    //   icon: MessageSquare,
    //   title: "Custom Notifications",
    //   description: "Personalize your notification messages and delivery preferences",
    //   included: !!(isPremium && user?.subscription_features?.customNotifications),
    //   emoji: "🔔",
    // },
    // {
    //   icon: Star,
    //   title: "Weekly Reports",
    //   description: "Get detailed weekly adherence reports and health insights",
    //   included: !!(isPremium && user?.subscription_features?.weeklyReports),
    //   emoji: "📊",
    // },
    {
      icon: Users,
      title: "Family Notifications",
      description: "Share medication reminders and updates with family members",
      included: !!(isPremium && user?.subscription_features?.familyNotifications),
      emoji: "👨‍👩‍👧‍👦",
    },
  ]

  if (isPremium) {
    return (
      <div className="space-y-4">
        {/* Premium Status Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Crown className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">{t("subscription.premium.title")} 👑</h2>
                <p className="text-purple-100 text-sm">{t("subscription.premium.description")}</p>
              </div>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-bold">Premium Active</span>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-md border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-gray-800">Subscription Details</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Status:</p>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Active Premium</span>
                </div>
              </div>
              {user?.subscription_expires_at && (
                <div>
                  <p className="text-xs text-gray-600">Expires on:</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(user.subscription_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 shadow-md border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-green-500" />
              <h3 className="font-bold text-sm text-gray-800">Health Benefits</h3>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-700">Enhanced medication tracking</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-700">Priority health support</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-700">Advanced wellness insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-md border border-purple-100">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-sm text-gray-800">Your Premium Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Management Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-sm text-gray-800">Manage Subscription</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center">
              <CreditCard className="mr-2 w-4 h-4" />
              Update Payment
            </button>
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center">
              <Clock className="mr-2 w-4 h-4" />
              Billing History
            </button>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl mb-2">🌟</div>
          <h3 className="text-lg font-bold mb-1">Thank you for being Premium!</h3>
          <p className="text-pink-100 text-sm">
            Your investment in premium features helps you maintain better health habits and achieve your wellness goals.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Pricing Card */}
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
        <div className="text-center mb-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 mb-3 border border-purple-200">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Gift className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-700">Premium Plan</span>
            </div>
            <div className="flex items-baseline justify-center">
              <span className="text-2xl font-bold text-purple-700">
                {symbol}
                {amount}
              </span>
              <span className="text-sm text-purple-600 ml-1">/month</span>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs font-bold mt-2 inline-block border border-yellow-200">
              🎯 Best Value for Your Health
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        
      </div>

      {/* Payment Methods */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 shadow-md border border-green-100">
        <div className="flex items-center space-x-2 mb-3">
          <CreditCard className="w-4 h-4 text-green-600" />
          <h3 className="font-bold text-sm text-gray-800">{t("subscription.upgrade.payment_methods.title")}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setSelectedPaymentMethod("stripe")}
            disabled={createCheckoutSession.isPending}
            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all duration-200 ${
              selectedPaymentMethod === "stripe"
                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md"
                : "border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{t("subscription.upgrade.payment_methods.stripe")}</span>
            <span className="ml-2">💳</span>
          </button>
          <button
            onClick={() => setSelectedPaymentMethod("mercadopago")}
            disabled={createCheckoutSession.isPending}
            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all duration-200 ${
              selectedPaymentMethod === "mercadopago"
                ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-md"
                : "border-gray-300 hover:border-purple-500 bg-white hover:bg-purple-50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{t("subscription.upgrade.payment_methods.mercadopago")}</span>
            <span className="ml-2">💰</span>
          </button>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={createCheckoutSession.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {createCheckoutSession.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("subscription.upgrade.processing")} {selectedPaymentMethod === "stripe" ? "Stripe" : "MercadoPago"}...
            </>
          ) : (
            <>
              <Crown className="mr-2 w-5 h-5" />
              {t("subscription.upgrade.button")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center mt-3">
          <p className="text-xs text-gray-600">
            💡 {t("subscription.upgrade.price", { symbol, amount })} • Cancel anytime
          </p>
          <p className="text-xs text-gray-500 mt-1">🔒 Secure payment processing • 30-day money-back guarantee</p>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl shadow-lg p-4 text-center">
        <div className="text-2xl mb-2">🚀</div>
        <h3 className="text-lg font-bold mb-1">Invest in Your Health Journey!</h3>
        <p className="text-pink-100 text-sm">
          Premium features help you stay consistent with your medications and achieve better health outcomes. Join
          thousands of users who've improved their wellness with our premium tools!
        </p>
      </div>
    </div>
  )
}
