import type React from "react"
import { Link } from "react-router-dom"
import { Clock, Calendar, Edit, Trash, Pill, Info } from "lucide-react"
import { formatTime } from "../utils/formatters"

export interface Medication {
  id: string
  name: string
  dosage: {
    amount: number
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
}

interface MedicationListProps {
  medications: Medication[]
  onDelete?: (id: string) => void
}

export const MedicationList: React.FC<MedicationListProps> = ({ medications, onDelete }) => {
  if (medications.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-5"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border-2 border-dashed border-blue-200 shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-300">
            <Pill className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No medications found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You don't have any medications yet. Start building your medication schedule by adding your first medication.
          </p>
          <Link
            to="/medications/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Pill className="w-5 h-5" />
            Add Your First Medication
          </Link>
        </div>
      </div>
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
          icon: Pill,
        }
      case "over-the-counter":
        return {
          gradient: "from-emerald-500 to-green-600",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: Pill,
        }
      case "vitamin":
        return {
          gradient: "from-amber-500 to-yellow-600",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: Pill,
        }
      case "supplement":
        return {
          gradient: "from-purple-500 to-violet-600",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: Pill,
        }
      default:
        return {
          gradient: "from-slate-500 to-gray-600",
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: Pill,
        }
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {medications.map((medication, index) => {
        const typeConfig = getMedicationTypeConfig(medication.medication_type)
        const TypeIcon = typeConfig.icon

        return (
          <div key={medication.id} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${typeConfig.gradient} rounded-3xl opacity-5`}></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Top Banner with Gradient */}
              <div className={`h-2 bg-gradient-to-r ${typeConfig.gradient}`}></div>

              <div className="p-6">
                {/* Header with Status */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 bg-gradient-to-r ${typeConfig.gradient} rounded-xl shadow-md`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {medication.name}
                      </h3>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} border shadow-sm`}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${typeConfig.gradient}`}></div>
                      {medication.medication_type.replace("-", " ")}
                    </div>
                  </div>

                  <div className="ml-3">
                    {medication.active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-medium shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 font-medium shadow-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Dosage */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-5"></div>
                    <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                      <p className="text-2xl font-bold text-gray-800">
                        {medication.dosage.amount}
                        <span className="text-lg font-medium text-gray-600 ml-1">{medication.dosage.unit}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Dosage</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 mb-1">Schedule</p>
                      <div className="flex flex-wrap gap-1">
                        {medication.scheduled_times.map((time, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium border border-blue-100 shadow-sm"
                          >
                            {formatTime(time)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 mb-1">Frequency</p>
                      {medication.frequency.specific_days?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {medication.frequency.specific_days
                            .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                            .map((day) => (
                              <span
                                key={day}
                                className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium border border-emerald-100 shadow-sm"
                              >
                                {day}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium border border-emerald-100 shadow-sm inline-block">
                          Every day
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {medication.instructions && (
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-5"></div>
                      <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          <p className="text-sm text-amber-800 font-medium">Instructions</p>
                        </div>
                        <p className="text-sm text-amber-700 italic">"{medication.instructions}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    to={`/medications/edit/${medication.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 border border-blue-200 hover:border-blue-300 font-medium group shadow-sm hover:shadow-md"
                  >
                    <Edit className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                    Edit
                  </Link>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(medication.id)}
                      className="flex-1 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 border border-red-200 hover:border-red-300 font-medium group shadow-sm hover:shadow-md"
                    >
                      <Trash className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
