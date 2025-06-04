"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pill, FileText, CheckCircle, AlertTriangle, Loader2, Beaker, ListChecks } from "lucide-react"
import { useMedicationById, useUpdateMedication } from "../hooks/useMedications"
import { LoadingSpinner } from "../components/LoadingSpinner"

export const EditMedication = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    dosage: {
      amount: "",
      unit: "mg",
    },
    frequency: {
      timesPerDay: 1,
      specificDays: [],
    },
    scheduledTimes: ["08:00"],
    instructions: "",
    medicationType: "prescription",
    active: true,
  })

  const { data: medication, isPending } = useMedicationById(id!)
  const { mutate: editMedication, isPending: isUpdating, isError, error } = useUpdateMedication()

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        dosage: {
          amount: medication.dosage?.amount || "",
          unit: medication.dosage?.unit || "mg",
        },
        frequency: {
          timesPerDay: medication.frequency?.timesPerDay,
          specificDays: medication.frequency.specificDays,
        },
        scheduledTimes: medication.scheduledTimes || ["08:00"],
        instructions: medication.instructions,
        medicationType: medication.medicationType || "prescription",
        active: medication.active,
      })
    }
  }, [medication])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    editMedication(
      {
        id: id!,
        medication: {
          name: formData.name,
          dosage: {
            amount: Number(formData.dosage.amount),
            unit: formData.dosage.unit,
          },
          frequency: {
            times_per_day: formData.frequency.timesPerDay,
            specific_days: formData.frequency.specificDays,
          },
          scheduled_times: formData.scheduledTimes,
          instructions: formData.instructions,
          medication_type: formData.medicationType,
          active: formData.active,
        },
      },
      {
        onSuccess: () => navigate(-1),
      },
    )
  }

  const getMedicationTypeConfig = (type: string) => {
    switch (type) {
      case "prescription":
        return {
          gradient: "from-blue-500 to-blue-600",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        }
      case "over-the-counter":
        return {
          gradient: "from-emerald-500 to-green-600",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
        }
      case "vitamin":
        return {
          gradient: "from-amber-500 to-yellow-600",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
        }
      case "supplement":
        return {
          gradient: "from-purple-500 to-violet-600",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
        }
      default:
        return {
          gradient: "from-slate-500 to-gray-600",
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
        }
    }
  }

  const typeConfig = getMedicationTypeConfig(formData.medicationType)

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-indigo-600 font-medium">Loading medication details...</p>
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
                <div className={`p-3 bg-gradient-to-r ${typeConfig.gradient} rounded-2xl shadow-lg`}>
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Edit Medication
                  </h1>
                  <p className="text-gray-600">Update the details of your medication</p>
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
                        <p className="text-red-600">{(error as Error)?.message || "Unexpected error"}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Amount</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Beaker className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={formData.dosage.amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dosage: { ...formData.dosage, amount: e.target.value },
                            })
                          }
                          className="pl-10 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
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
                        <option value="tablet">tablet</option>
                        <option value="capsule">capsule</option>
                        <option value="pill">pill</option>
                        <option value="injection">injection</option>
                        <option value="patch">patch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Type</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Pill className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.medicationType}
                        onChange={(e) => setFormData({ ...formData, medicationType: e.target.value })}
                        className="pl-10 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/60 shadow-sm"
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
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                    <ListChecks className="w-5 h-5 text-white" />
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

                  <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        formData.active ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gray-300"
                      }`}
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          formData.active ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                    <label className="ml-3 block text-sm text-gray-700">Active Medication</label>
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
