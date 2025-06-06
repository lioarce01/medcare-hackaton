import React from "react"
import { Link } from "react-router-dom"
import { Clock, Edit, Trash, Pill, Heart, Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { MedicationCardProps, MedicationTypeConfig, MedicationType } from "../types/medication_types"

// Memoize the medication type configuration
const getMedicationTypeConfig = (type: MedicationType): MedicationTypeConfig => {
  switch (type) {
    case "prescription":
      return {
        gradient: "from-blue-400 to-cyan-500",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Pill,
        emoji: "💊",
      }
    case "over-the-counter":
      return {
        gradient: "from-emerald-400 to-green-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: Pill,
        emoji: "🌿",
      }
    case "vitamin":
      return {
        gradient: "from-amber-400 to-yellow-500",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Star,
        emoji: "⭐",
      }
    case "supplement":
      return {
        gradient: "from-purple-400 to-violet-500",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: Heart,
        emoji: "💜",
      }
    default:
      return {
        gradient: "from-slate-400 to-gray-500",
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: Pill,
        emoji: "💊",
      }
  }
}

const MedicationCard: React.FC<MedicationCardProps> = React.memo(({ medication, onDelete, index }) => {
  const { t } = useTranslation()
  const typeConfig = getMedicationTypeConfig(medication.medication_type as MedicationType)
  const TypeIcon = typeConfig.icon

  return (
    <div
      className="group relative bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-3 bg-gradient-to-r ${typeConfig.gradient} rounded-2xl shadow-md`}>
                <TypeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                  {medication.name}
                </h3>
                <span className="text-2xl">{typeConfig.emoji}</span>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} border shadow-sm`}
            >
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${typeConfig.gradient}`}></div>
              {t(`medications.list.medication.type.${medication.medication_type}`)}
            </div>
          </div>

          <div>
            {medication.active ? (
              <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-medium shadow-sm">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                {t("medications.list.medication.status.active")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 px-4 py-2 rounded-xl border border-gray-200 font-medium shadow-sm">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                {t("medications.list.medication.status.inactive")}
              </span>
            )}
          </div>
        </div>

        {/* Dosage Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold mb-1">
                  {medication.dosage.amount}
                  <span className="text-xl font-medium ml-2">{medication.dosage.unit}</span>
                </p>
                <p className="text-blue-100">{t("medications.list.medication.details.dosage")}</p>
              </div>
              <div className="text-4xl">💊</div>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="text-sm font-bold text-gray-700">{t("medications.list.medication.details.schedule")}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {medication.scheduled_times.map((time, index) => (
              <span
                key={`${medication.id}-time-${index}`}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 shadow-sm"
              >
                {time}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to={`/medications/edit/${medication.id}`}
            className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors rounded-xl hover:shadow-md"
          >
            <Edit className="w-5 h-5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(medication.id)}
              className="p-3 bg-red-100 text-red-600 hover:bg-red-200 transition-colors rounded-xl hover:shadow-md"
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

MedicationCard.displayName = "MedicationCard"

export default MedicationCard
