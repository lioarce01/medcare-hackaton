"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Bell,
  Clock,
  Globe,
  Mail,
  Plus,
  Settings,
  Smartphone,
  Trash2,
  Save,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useUpdateReminderSettings, useUserSettings } from "../../api/reminders"
import { useToast } from "../../hooks/useToast"
import type { ReminderSettings as ReminderSettingsType } from "../../types/reminder"

export const ReminderSettings = () => {
  const { showToast } = useToast()
  const updateSettings = useUpdateReminderSettings()
  const { data: userSettings } = useUserSettings()
  const [settings, setSettings] = useState<ReminderSettingsType>({
    emailEnabled: true,
    preferredTimes: ["08:00", "14:00", "20:00"],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationPreferences: {
      email: true,
      push: false,
    },
  })
  const [localTimes, setLocalTimes] = useState<string[]>([])

  useEffect(() => {
    if (userSettings) {
      // Update local timezone
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      setSettings((prev) => ({
        ...userSettings,
        timezone: localTimezone, // Force local timezone
      }))

      // Convert UTC times to local time
      const localTimeArray = userSettings.preferredTimes.map((time) => {
        const [hours, minutes] = time.split(":")
        const date = new Date()
        date.setUTCHours(Number.parseInt(hours), Number.parseInt(minutes))
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      })
      setLocalTimes(localTimeArray)
    }
  }, [userSettings])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggle = (type: "email" | "push") => {
    setSettings((prev) => ({
      ...prev,
      emailEnabled: type === "email" ? !prev.emailEnabled : prev.emailEnabled,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: !prev.notificationPreferences[type],
      },
    }))
  }

  const handleTimeChange = (index: number, newTime: string) => {
    const newTimes = [...localTimes]
    newTimes[index] = newTime
    setLocalTimes(newTimes)
  }

  const addTimeSlot = () => {
    setSettings((prev) => ({
      ...prev,
      preferredTimes: [...prev.preferredTimes, "12:00"],
    }))
    setLocalTimes((prev) => [...prev, "12:00"])
  }

  const removeTimeSlot = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter((_, i) => i !== index),
    }))
    setLocalTimes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Get current local timezone
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Convert local times to UTC before saving
      const utcTimes = localTimes.map((time) => {
        const [hours, minutes] = time.split(":")
        const date = new Date()
        date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
        return date.toISOString().slice(11, 16)
      })

      const settingsToUpdate = {
        emailEnabled: settings.emailEnabled,
        preferredTimes: utcTimes,
        timezone: localTimezone, // Use current local timezone
        notificationPreferences: settings.notificationPreferences,
      }

      await updateSettings.mutateAsync(settingsToUpdate)
      showToast("Settings saved successfully", "success")
    } catch (error) {
      console.error("Error updating settings:", error)
      showToast("Error saving settings", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Reminder Settings</h3>
            <p className="text-blue-100 text-sm">Customize how and when you receive medication reminders</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Notification Preferences */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md border border-purple-100/50 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">Notification Preferences</h4>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-800">Email Notifications</h5>
                  <p className="text-xs text-gray-600">Receive reminders via email</p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.notificationPreferences.email
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                    : "bg-gray-300"
                }`}
                onClick={() => handleToggle("email")}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.notificationPreferences.email ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-800">Push Notifications</h5>
                  <p className="text-xs text-gray-600">Receive notifications on your device</p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.notificationPreferences.push
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gray-300"
                }`}
                onClick={() => handleToggle("push")}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.notificationPreferences.push ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Times */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-md border border-pink-100/50 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-md">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Preferred Times</h4>
              <p className="text-xs text-gray-600">Choose when you'd like to receive reminders</p>
            </div>
          </div>

          <div className="space-y-3">
            {localTimes.map((time, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200"
              >
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Clock className="h-4 w-4 text-pink-400" />
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white transition-all duration-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                  title="Remove time slot"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addTimeSlot}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-2 border-dashed border-pink-300 rounded-xl hover:from-pink-200 hover:to-rose-200 transition-all duration-200 flex items-center justify-center font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Time Slot
            </button>
          </div>
        </div>

        {/* Timezone Information */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-md border border-green-100/50 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Timezone</h4>
              <p className="text-xs text-gray-600">Your current timezone setting</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Globe className="h-4 w-4 text-green-400" />
            </div>
            <input
              type="text"
              value={settings.timezone}
              disabled
              className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg bg-green-50 text-gray-700 font-medium"
            />
          </div>
          <div className="mt-2 p-2 bg-green-100 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Automatically detected: {settings.timezone}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </>
          )}
        </button>

        {/* Helpful Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-700">
              <span className="font-bold">Tip:</span> Setting up multiple reminder times throughout the day can help
              improve your medication adherence. We recommend spacing them evenly based on your daily routine.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {updateSettings.isSuccess && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl p-3 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">Settings saved successfully! Your preferences have been updated.</p>
          </div>
        )}

        {/* Error Message */}
        {updateSettings.isError && (
          <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl p-3 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error saving settings. Please try again.</p>
          </div>
        )}
      </form>
    </div>
  )
}
