import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  Pill,
  Calendar,
  Bell,
  FileText,
  AlertCircle,
  CheckCircle,
  Heart,
  Sparkles,
} from "lucide-react"
import { useCreateMedication } from "../hooks/useMedications"
import { useTranslation } from "react-i18next"
import { useToast } from "../components/Toast"

interface MedicationFormData {
  name: string
  dosage: {
    amount: number | string
    unit: string
  }
  scheduled_times: string[]
  frequency: {
    times_per_day: number
    specific_days: string[]
  }
  instructions?: string
  active: boolean
  medication_type: string
  image_url?: string
  start_date: string
  end_date?: string
  refill_reminder: {
    enabled: boolean
    threshold: number
    last_refill: string | null
    next_refill: string | null
    supply_amount: number
    supply_unit: string
  }
  side_effects_to_watch: string[]
}

export const AddMedication = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMedication = useCreateMedication()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    dosage: {
      amount: "",
      unit: "mg",
    },
    frequency: {
      times_per_day: 1,
      specific_days: [],
    },
    scheduled_times: ["08:00"],
    instructions: "",
    medication_type: "prescription",
    active: true,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    refill_reminder: {
      enabled: false,
      threshold: 7,
      last_refill: null,
      next_refill: null,
      supply_amount: 0,
      supply_unit: "days",
    },
    side_effects_to_watch: [],
    image_url: "",
  })

  const [newSideEffect, setNewSideEffect] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (createMedication.isError) {
      showToast(t("medications.add.error"), "error")
    }
  }, [createMedication.isError, t, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const startDate = new Date(formData.start_date)
    startDate.setHours(0, 0, 0, 0)

    const medicationData = {
      ...formData,
      scheduled_times: formData.scheduled_times,
      start_date: startDate.toISOString(),
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    try {
      await createMedication.mutateAsync(medicationData)
      showToast(t("medications.add.success"), "success")
      setFormSubmitted(true)
      setTimeout(() => navigate("/medications"), 1500)
    } catch (err) {
      showToast(t("medications.add.error"), "error")
    }
  }

  const addScheduledTime = () => {
    setFormData((prev) => ({
      ...prev,
      scheduled_times: [...prev.scheduled_times, "08:00"],
    }))
  }

  const removeScheduledTime = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scheduled_times: prev.scheduled_times.filter((_, i) => i !== index),
    }))
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const days = prev.frequency.specific_days
      const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
      return {
        ...prev,
        frequency: {
          ...prev.frequency,
          specific_days: newDays,
        },
      }
    })
  }

  const handleAddSideEffect = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSideEffect.trim()) {
      e.preventDefault()
      setFormData((prev) => ({
        ...prev,
        side_effects_to_watch: [...prev.side_effects_to_watch, newSideEffect.trim()],
      }))
      setNewSideEffect("")
    }
  }

  const removeSideEffect = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      side_effects_to_watch: prev.side_effects_to_watch.filter((_, i) => i !== index),
    }))
  }

  const toggleRefillReminder = () => {
    setFormData((prev) => ({
      ...prev,
      refill_reminder: {
        ...prev.refill_reminder,
        enabled: !prev.refill_reminder.enabled,
      },
    }))
  }

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{t("add_medication.page.success.title")}</h2>
          <p className="text-gray-600 mb-6">{t("add_medication.page.success.message")}</p>
          <div className="text-center">
            <p className="text-sm text-gray-500">{t("add_medication.page.success.redirecting")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center py-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Medication 💊</h1>
          <p className="text-gray-600">Let's add a new medication to your health journey</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-white/50 hover:bg-white/90 hover:shadow-xl transform hover:-translate-y-1"
        >
          <ArrowLeft className="mr-2" size={20} />
          {t("add_medication.page.back")}
        </button>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{t("add_medication.page.title")}</h2>
                <p className="text-blue-100">{t("add_medication.page.subtitle")}</p>
              </div>
            </div>
          </div>

          {createMedication.isError && (
            <div className="mx-8 mt-8">
              <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{t("add_medication.page.error.title")}</h3>
                    <p className="text-red-100">
                      {(createMedication.error as Error)?.message || t("add_medication.page.error.message")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg border border-purple-100/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{t("add_medication.sections.basic.title")}</h3>
                  <p className="text-gray-600">Tell us about your medication</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("add_medication.sections.basic.fields.name")}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                    required
                    placeholder="Enter medication name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t("add_medication.sections.basic.fields.dosage.amount")}
                    </label>
                    <input
                      type="number"
                      value={formData.dosage.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dosage: { ...formData.dosage, amount: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                      required
                      min="0"
                      step="any"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t("add_medication.sections.basic.fields.dosage.unit")}
                    </label>
                    <select
                      value={formData.dosage.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dosage: { ...formData.dosage, unit: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                    >
                      {Object.entries(
                        t("add_medication.sections.basic.fields.dosage.options", { returnObjects: true }),
                      ).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("add_medication.sections.basic.fields.type.label")}
                  </label>
                  <select
                    value={formData.medication_type}
                    onChange={(e) => setFormData({ ...formData, medication_type: e.target.value })}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                  >
                    {Object.entries(
                      t("add_medication.sections.basic.fields.type.options", { returnObjects: true }),
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl shadow-lg border border-pink-100/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{t("add_medication.sections.schedule.title")}</h3>
                  <p className="text-gray-600">When should you take this medication?</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    {t("add_medication.sections.schedule.fields.days.label")}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                          formData.frequency.specific_days.includes(day)
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                            : "bg-white/80 text-gray-700 border-2 border-gray-200 hover:bg-white hover:border-purple-300"
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3 bg-purple-50 p-3 rounded-lg">
                    💡 {t("add_medication.sections.schedule.fields.days.empty_message")}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-gray-700">
                      {t("add_medication.sections.schedule.fields.times.label")}
                    </label>
                    <button
                      type="button"
                      onClick={addScheduledTime}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      {t("add_medication.sections.schedule.fields.times.add")}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.scheduled_times.map((time, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-4 shadow-sm">
                          <div className="flex items-center">
                            <Clock className="text-purple-500 mr-3" size={20} />
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...formData.scheduled_times]
                                newTimes[index] = e.target.value
                                setFormData({ ...formData, scheduled_times: newTimes })
                              }}
                              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium"
                              required
                            />
                          </div>
                        </div>
                        {formData.scheduled_times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduledTime(index)}
                            className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Minus size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t("add_medication.sections.schedule.fields.start_date")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full pl-12 rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/80 shadow-sm text-lg py-4"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t("add_medication.sections.schedule.fields.end_date")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full pl-12 rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/80 shadow-sm text-lg py-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refill Reminder */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-lg border border-orange-100/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{t("add_medication.sections.refill.title")}</h3>
                  <p className="text-gray-600">Never run out of your medication</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="refillEnabled"
                    checked={formData.refill_reminder.enabled}
                    onChange={toggleRefillReminder}
                    className="h-6 w-6 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="refillEnabled" className="ml-3 block text-lg font-bold text-gray-700">
                    {t("add_medication.sections.refill.fields.enable")}
                  </label>
                </div>

                {formData.refill_reminder.enabled && (
                  <div className="space-y-6 pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          {t("add_medication.sections.refill.fields.supply.amount")}
                        </label>
                        <input
                          type="number"
                          value={formData.refill_reminder.supply_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              refill_reminder: {
                                ...formData.refill_reminder,
                                supply_amount: Number.parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          {t("add_medication.sections.refill.fields.supply.unit")}
                        </label>
                        <select
                          value={formData.refill_reminder.supply_unit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              refill_reminder: {
                                ...formData.refill_reminder,
                                supply_unit: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                        >
                          {Object.entries(
                            t("add_medication.sections.refill.fields.supply.options", { returnObjects: true }),
                          ).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        {t("add_medication.sections.refill.fields.threshold")}
                      </label>
                      <input
                        type="number"
                        value={formData.refill_reminder.threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refill_reminder: {
                              ...formData.refill_reminder,
                              threshold: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-lg border border-green-100/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{t("add_medication.sections.additional.title")}</h3>
                  <p className="text-gray-600">Additional details and notes</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("add_medication.sections.additional.fields.instructions.label")}
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                    rows={4}
                    placeholder={t("add_medication.sections.additional.fields.instructions.placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("add_medication.sections.additional.fields.side_effects.label")}
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <input
                        type="text"
                        value={newSideEffect}
                        onChange={(e) => setNewSideEffect(e.target.value)}
                        onKeyDown={handleAddSideEffect}
                        className="w-full pl-12 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 bg-white/80 shadow-sm text-lg py-4"
                        placeholder={t("add_medication.sections.additional.fields.side_effects.placeholder")}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {formData.side_effects_to_watch.map((effect, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-2 border-red-200 shadow-sm font-medium"
                        >
                          {effect}
                          <button
                            type="button"
                            onClick={() => removeSideEffect(index)}
                            className="ml-2 text-red-600 hover:text-red-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("add_medication.sections.additional.fields.image.label")}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80 shadow-sm text-lg py-4 px-4"
                    placeholder={t("add_medication.sections.additional.fields.image.placeholder")}
                  />
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-6 w-6 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-3 block text-lg font-bold text-gray-700">
                      {t("add_medication.sections.additional.fields.active")}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={createMedication.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 px-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center mx-auto"
              >
                <Heart className="mr-3 w-6 h-6" />
                {createMedication.isPending ? t("add_medication.actions.adding") : t("add_medication.actions.add")}
              </button>
            </div>
          </form>

          {/* Motivational Footer */}
          <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-8 text-center">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-xl font-bold mb-2">You're taking great care of yourself!</h3>
            <p className="text-pink-100">Adding medications to track is an important step in your health journey.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
