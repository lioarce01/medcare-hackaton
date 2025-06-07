"use client"
import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (user && user.subscription_status !== "premium") {
      navigate("/subscription")
    }
  }, [user, navigate])

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
