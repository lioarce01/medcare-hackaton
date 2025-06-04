import type React from "react"
import { useState } from "react"
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
} from "lucide-react"
import { useCreateMedication } from "../hooks/useMedications"

export const AddMedication = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    dosage: {
      amount: "",
      unit: "mg",
    },
    frequency: {
      times_per_day: 1,
      specific_days: [] as string[],
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
    side_effects_to_watch: [] as string[],
    image_url: "",
  })

  const { mutate: AddMedication, isPending, isError, error } = useCreateMedication()

  const [newSideEffect, setNewSideEffect] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  
    // Prepara los datos - Para app internacional
    const startDate = new Date(formData.start_date)
    startDate.setHours(0, 0, 0, 0)
  
    const medicationData = {
      ...formData,
      scheduled_times: formData.scheduled_times, // Enviar en hora local (se convertirá a UTC en el API)
      start_date: startDate.toISOString(),
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Detectar zona horaria automáticamente
    }
  
    AddMedication(medicationData, {
      onSuccess: () => {
        setFormSubmitted(true)
        setTimeout(() => navigate("/medications"), 1500)
      },
      onError: (err: any) => {
        console.error("Error adding medication:", err)
      },
    })
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Medication Added!</h2>
            <p className="text-gray-600 text-center mb-6">Your medication has been successfully added to your list.</p>
            <div className="text-center">
              <p className="text-sm text-gray-500">Redirecting to medications list...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20 hover:bg-white/90"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Medications
        </button>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Add New Medication
                  </h1>
                  <p className="text-gray-600">Enter the details of your medication</p>
                </div>
              </div>
            </div>

            {isError && (
              <div className="mx-8 mt-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800">Error occurred</h3>
                        <p className="text-red-600">{(error as Error)?.message || "Unexpected Error"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Amount *</label>
                      <input
                        type="number"
                        value={formData.dosage.amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dosage: { ...formData.dosage, amount: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                        required
                        min="0"
                        step="any"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <select
                        value={formData.dosage.unit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dosage: { ...formData.dosage, unit: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                      >
                        <option value="mg">mg</option>
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="mcg">mcg</option>
                        <option value="IU">IU</option>
                        <option value="tablet">tablet</option>
                        <option value="capsule">capsule</option>
                        <option value="pill">pill</option>
                        <option value="injection">injection</option>
                        <option value="patch">patch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Type *</label>
                    <select
                      value={formData.medication_type}
                      onChange={(e) => setFormData({ ...formData, medication_type: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                    >
                      <option value="prescription">Prescription</option>
                      <option value="over-the-counter">Over the Counter</option>
                      <option value="vitamin">Vitamin</option>
                      <option value="supplement">Supplement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Schedule</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            formData.frequency.specific_days.includes(day)
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md transform scale-105"
                              : "bg-white/60 text-gray-700 border border-gray-200 hover:bg-white/80"
                          }`}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Leave empty to take medication every day</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Scheduled Times *</label>
                      <button
                        type="button"
                        onClick={addScheduledTime}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Time
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.scheduled_times.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 flex items-center bg-white/60 rounded-xl border border-gray-200 p-3 shadow-sm">
                            <Clock className="text-indigo-500 mr-3" size={18} />
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...formData.scheduled_times]
                                newTimes[index] = e.target.value
                                setFormData({ ...formData, scheduled_times: newTimes })
                              }}
                              className="flex-1 bg-transparent border-none focus:ring-0"
                              required
                            />
                          </div>
                          {formData.scheduled_times.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeScheduledTime(index)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full pl-10 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full pl-10 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                          min={formData.start_date}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refill Reminder */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-md">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Refill Reminder</h2>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="refillEnabled"
                      checked={formData.refill_reminder.enabled}
                      onChange={toggleRefillReminder}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="refillEnabled" className="ml-2 block text-sm text-gray-700">
                      Enable refill reminders
                    </label>
                  </div>

                  {formData.refill_reminder.enabled && (
                    <div className="space-y-4 pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Supply Amount</label>
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
                            className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/60 shadow-sm"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Supply Unit</label>
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
                            className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/60 shadow-sm"
                          >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                            <option value="months">Months</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reminder Threshold (days before refill needed)
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
                          className="w-full rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500 bg-white/60 shadow-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Additional Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white/60 shadow-sm"
                      rows={3}
                      placeholder="E.g., Take with food, Avoid alcohol, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects to Watch</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <input
                          type="text"
                          value={newSideEffect}
                          onChange={(e) => setNewSideEffect(e.target.value)}
                          onKeyDown={handleAddSideEffect}
                          className="w-full pl-10 rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 bg-white/60 shadow-sm"
                          placeholder="Press Enter to add"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.side_effects_to_watch.map((effect, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 shadow-sm"
                          >
                            {effect}
                            <button
                              type="button"
                              onClick={() => removeSideEffect(index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white/60 shadow-sm"
                      placeholder="https://example.com/medication-image.jpg"
                    />
                  </div>

                  <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                      Active Medication
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isPending ? "Adding..." : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
