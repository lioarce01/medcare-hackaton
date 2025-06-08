import type React from "react"
import { SubscriptionManager } from "../components/SubscriptionManager"
import { useTranslation } from "react-i18next"
import { Crown } from "lucide-react"

export const Subscription: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6">
      <div className="max-w-3xl mx-auto px-4">

        {/* Enhanced Header Card */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{t("subscription.upgrade.title")}</h2>
                <p className="text-purple-100 text-sm">Choose the perfect plan for your wellness needs</p>
              </div>
            </div>
          </div>

          {/* Subscription Manager Container */}
          <div className="p-6">
            <SubscriptionManager />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription
