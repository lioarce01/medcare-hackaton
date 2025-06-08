import type { Reminder } from "../../types/reminder"
import { Trash2, Send, Bell, Calendar, Clock, Heart, Sparkles } from "lucide-react"

interface ReminderListProps {
  reminders: Reminder[]
  onReminderDeleted: (reminderId: string) => void
  onReminderSent: (reminderId: string) => void
}

export const ReminderList = ({ reminders, onReminderDeleted, onReminderSent }: ReminderListProps) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
          <Bell className="w-10 h-10 text-white" />
        </div>
        <div className="text-3xl mb-3">🔔</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Reminders Yet</h3>
        <p className="text-gray-600">You don't have any scheduled reminders at the moment</p>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          variant: "warning" as const,
          gradient: "from-amber-400 to-orange-500",
          bg: "from-amber-50 to-orange-50",
          text: "text-amber-700",
          border: "border-amber-200",
          emoji: "⏰",
        }
      case "sent":
        return {
          variant: "success" as const,
          gradient: "from-emerald-400 to-green-500",
          bg: "from-emerald-50 to-green-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          emoji: "✅",
        }
      case "failed":
        return {
          variant: "error" as const,
          gradient: "from-red-400 to-rose-500",
          bg: "from-red-50 to-rose-50",
          text: "text-red-700",
          border: "border-red-200",
          emoji: "❌",
        }
      default:
        return {
          variant: "info" as const,
          gradient: "from-blue-400 to-indigo-500",
          bg: "from-blue-50 to-indigo-50",
          text: "text-blue-700",
          border: "border-blue-200",
          emoji: "💫",
        }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "sent":
        return "Sent"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder, index) => {
        const statusConfig = getStatusConfig(reminder.status)

        return (
          <div
            key={reminder.id}
            className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-3 bg-gradient-to-r ${statusConfig.gradient} rounded-xl shadow-md`}>
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                          {reminder.medications?.name || "Medication Reminder"}
                        </h3>
                        <span className="text-xl">{statusConfig.emoji}</span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-bold bg-gradient-to-r ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusConfig.gradient}`}></div>
                        {getStatusText(reminder.status)}
                      </div>
                    </div>
                  </div>

                  {/* Date and Time Info */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-600">
                        {new Date(reminder.scheduled_date).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-600">{reminder.scheduled_time}</span>
                    </div>
                  </div>

                  {/* Message */}
                  {reminder.message && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border-l-4 border-blue-400 mb-3">
                      <p className="text-sm text-gray-700 italic font-medium">💬 "{reminder.message}"</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onReminderSent(reminder.id)}
                    className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 group/btn"
                    title="Send reminder"
                  >
                    <Send className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => onReminderDeleted(reminder.id)}
                    className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 group/btn"
                    title="Delete reminder"
                  >
                    <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Additional Info Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600 font-medium">
                    {reminder.status === "pending"
                      ? "Reminder scheduled and ready to send"
                      : reminder.status === "sent"
                        ? "Successfully delivered to your device"
                        : "Failed to deliver - please try again"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-pink-500" />
                  <span className="text-xs text-gray-500">Health Care</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
