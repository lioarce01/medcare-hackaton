import type React from "react"
import { SubscriptionManager } from "@/components/premium/subscription-manager"
import { Crown } from 'lucide-react'

export const Subscription: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Enhanced Header Card */}
        <div className="bg-card border rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Premium Subscription</h1>
                <p className="text-purple-100 text-base leading-relaxed">
                  Unlock advanced features to enhance your medication management experience
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Manager Container */}
          <div className="p-8">
            <SubscriptionManager />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription