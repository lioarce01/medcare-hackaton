import type React from "react"

import { useState } from "react"
import { Bell, Calendar, Clock, MessageCircle, Pill, PlusCircle, Sparkles } from "lucide-react"
import type { Reminder } from "../../types/reminder"
import { useMedications } from "../../hooks/useMedications"

interface CreateReminderProps {
  onReminderCreated: (data: Omit<Reminder, "id" | "user_id" | "created_at" | "updated_at">) => void
}

export const CreateReminder = ({ onReminderCreated }: CreateReminderProps) => {
  const [formData, setFormData] = useState({
    medication_id: "",
    scheduled_date: "",
    scheduled_time: "",
    message: "",
  })

  const { data: medications = { all: [] } } = useMedications()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.medication_id || !formData.scheduled_date || !formData.scheduled_time) {
      alert("Please complete all required fields")
      return
    }

    // Validate date and time are not null
    const scheduledTime = formData.scheduled_time.trim()
    const scheduledDate = formData.scheduled_date.trim()

    if (!scheduledTime || !scheduledDate) {
      alert("Date and time are required")
      return
    }

    const selectedMedication = medications.all.find((m) => m.id === formData.medication_id)

    // Format time to HH:mm
    const [hours, minutes] = scheduledTime.split(":")
    const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`

    // Combine date and time in ISO format with UTC timezone
    const scheduledDateTime = `${scheduledDate}T${formattedTime}:00.000000+00`

    const reminderData = {
      medication_id: formData.medication_id,
      scheduled_date: scheduledDateTime,
      scheduled_time: formattedTime,
      message: formData.message || undefined,
      status: "pending" as const,
      channels: {
        email: { sent: false, enabled: true },
        sms: { sent: false, enabled: false },
      },
      retry_count: 0,
      medications: selectedMedication
        ? {
            name: selectedMedication.name,
            dosage: selectedMedication.dosage,
            instructions: selectedMedication.instructions,
          }
        : { name: "", dosage: "", instructions: "" },
    }

    console.log("Sending reminder data:", reminderData)
    onReminderCreated(reminderData)
    setFormData({
      medication_id: "",
      scheduled_date: "",
      scheduled_time: "",
      message: "",
    })
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Create New Reminder</h3>
            <p className="text-blue-100 text-sm">Schedule a reminder for your medication</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Medication Selection */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-1">
            <Pill className="w-4 h-4 text-purple-500" />
            <span>Medication</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="medication_id"
              value={formData.medication_id}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
              required
            >
              <option value="">Select a medication</option>
              {medications.all.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {medication.name} - {medication.dosage.amount} {medication.dosage.unit}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Pill className="h-4 w-4 text-purple-400" />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Date</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
              required
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-1">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>Time</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white transition-all duration-200"
              required
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Clock className="h-4 w-4 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-1">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span>Message (optional)</span>
          </label>
          <div className="relative">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 min-h-[100px]"
              placeholder="Add a personal note to your reminder..."
            />
            <div className="absolute left-3 top-4">
              <MessageCircle className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-bold"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Reminder
        </button>

        {/* Helpful Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-700">
            <span className="font-bold">Tip:</span> Setting up regular reminders helps improve your medication adherence
            and overall health outcomes. You'll receive a notification at your scheduled time.
          </p>
        </div>
      </form>
    </div>
  )
}
