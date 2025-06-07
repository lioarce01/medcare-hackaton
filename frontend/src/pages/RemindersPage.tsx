"use client"
import { useState } from "react"
import { Bell, Crown, Plus, List, Sparkles, CheckCircle, Calendar, Clock, Heart, Star, ArrowRight } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import { useNavigate } from "react-router-dom"
import { useReminders, useCreateReminder, useDeleteReminder, useSendReminderManually } from "../api/reminders"
import { CreateReminder } from "../components/reminders/CreateReminder"
import { ReminderList } from "../components/reminders/ReminderList"

export const RemindersPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("create")
  const { data: reminders = [] } = useReminders()
  const createReminder = useCreateReminder()
  const deleteReminder = useDeleteReminder()
  const sendReminderManually = useSendReminderManually()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id)
      showToast("Reminder deleted successfully", "success")
    } catch (error) {
      showToast("Could not delete reminder", "error")
    }
  }

  const handleSendReminder = async (id: string) => {
    try {
      await sendReminderManually.mutateAsync(id)
      showToast("Reminder sent successfully", "success")
    } catch (error) {
      showToast("Could not send reminder", "error")
    }
  }

  if (user?.subscription_status !== "premium") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Premium Reminders 👑</h1>
            <p className="text-gray-600 text-sm">Unlock advanced reminder features with Premium</p>
          </div>

          {/* Premium Upgrade Card */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1">Premium Reminders</h2>
                  <p className="text-purple-100 text-sm">Upgrade your account to access all reminder features</p>
                </div>
              </div>

              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="font-medium">Premium Feature</span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                  What you'll get with Premium:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Bell,
                      title: "Unlimited Reminders",
                      description: "Create as many reminders as you need",
                      gradient: "from-blue-400 to-cyan-500",
                    },
                    {
                      icon: CheckCircle,
                      title: "Email Notifications",
                      description: "Receive reminders directly in your inbox",
                      gradient: "from-green-400 to-emerald-500",
                    },
                    {
                      icon: Calendar,
                      title: "Custom Messages",
                      description: "Personalize your reminder messages",
                      gradient: "from-purple-400 to-pink-500",
                    },
                    {
                      icon: Clock,
                      title: "Weekly Reports",
                      description: "Get detailed adherence reports",
                      gradient: "from-orange-400 to-red-500",
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 bg-gradient-to-r ${feature.gradient} rounded-lg shadow-sm`}>
                          <feature.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1 text-sm">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 mb-6">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center text-sm">
                  <Heart className="w-4 h-4 text-pink-500 mr-2" />
                  And much more...
                </h4>
                <ul className="space-y-1">
                  {[
                    "Advanced medication tracking",
                    "Priority customer support",
                    "Export your health data",
                    "Family sharing features",
                    "Medication interaction alerts",
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={() => navigate("/subscription")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-bold"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>

            {/* Motivational Footer */}
            <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-4 text-center">
              <div className="text-2xl mb-2">🌟</div>
              <h3 className="text-lg font-bold mb-1">Invest in Your Health Journey!</h3>
              <p className="text-pink-100 text-sm">
                Premium reminders help you stay consistent with your medications and achieve better health outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6">
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div className="space-y-5">
          {/* Header Section */}
          <div className="text-center py-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Reminders 🔔</h1>
            <p className="text-gray-600 text-sm">Stay on track with personalized medication reminders</p>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1">Reminder Management</h2>
                  <p className="text-blue-100 text-sm">Create and manage your medication reminders</p>
                </div>
              </div>

              {/* Tab Buttons */}
              <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => handleTabChange("create")}
                  className={`flex items-center px-3 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                    activeTab === "create" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20"
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </button>
                <button
                  onClick={() => handleTabChange("list")}
                  className={`flex items-center px-3 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                    activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/20"
                  }`}
                >
                  <List className="w-4 h-4 mr-1" />
                  My Reminders ({reminders.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "create" && (
            <div className="space-y-5">
              <CreateReminder onReminderCreated={createReminder.mutate} />
            </div>
          )}

          {activeTab === "list" && (
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <List className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">My Reminders</h3>
                    <p className="text-purple-100 text-sm">Manage all your scheduled reminders</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <ReminderList
                  reminders={reminders}
                  onReminderDeleted={handleDeleteReminder}
                  onReminderSent={handleSendReminder}
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {reminders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: "Total Reminders",
                  value: reminders.length,
                  icon: Bell,
                  gradient: "from-blue-400 to-cyan-500",
                  emoji: "🔔",
                },
                {
                  title: "Pending",
                  value: reminders.filter((r) => r.status === "pending").length,
                  icon: Clock,
                  gradient: "from-orange-400 to-red-500",
                  emoji: "⏰",
                },
                {
                  title: "Sent",
                  value: reminders.filter((r) => r.status === "sent").length,
                  icon: CheckCircle,
                  gradient: "from-green-400 to-emerald-500",
                  emoji: "✅",
                },
              ].map((stat, index) => (
                <div
                  key={stat.title}
                  className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl shadow-md p-4 transform transition-all duration-300 hover:-translate-y-1`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5" />
                    <span className="text-xl">{stat.emoji}</span>
                  </div>
                  <div className="text-xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/90 font-medium text-sm">{stat.title}</div>
                </div>
              ))}
            </div>
          )}

          {/* Motivational Footer */}
          <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl mb-2">🌟</div>
            <h3 className="text-lg font-bold mb-1">Stay consistent with your health!</h3>
            <p className="text-pink-100 text-sm">
              Regular reminders help you maintain your medication schedule and improve your overall well-being.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
