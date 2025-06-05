import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Edit, Trash, Pill } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MedicationCardProps, MedicationTypeConfig, MedicationType } from '../types/medication_types'

// Memoize the medication type configuration
const getMedicationTypeConfig = (type: MedicationType): MedicationTypeConfig => {
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

const MedicationCard: React.FC<MedicationCardProps> = React.memo(({ medication, onDelete, index }) => {
  const { t } = useTranslation()
  const typeConfig = getMedicationTypeConfig(medication.medication_type as MedicationType)
  const TypeIcon = typeConfig.icon

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
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
              {t(`medications.list.medication.type.${medication.medication_type}`)}
            </div>
          </div>

          <div>
            {medication.active ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-medium shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                {t('medications.list.medication.status.active')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 font-medium shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                {t('medications.list.medication.status.inactive')}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-5"></div>
            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
              <p className="text-2xl font-bold text-gray-800">
                {medication.dosage.amount}
                <span className="text-lg font-medium text-gray-600 ml-1">{medication.dosage.unit}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{t('medications.list.medication.details.dosage')}</p>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">{t('medications.list.medication.details.schedule')}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {medication.scheduled_times.map((time, index) => (
              <span
                key={`${medication.id}-time-${index}`}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
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
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
          >
            <Edit className="w-5 h-5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(medication.id)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

MedicationCard.displayName = 'MedicationCard'

export default MedicationCard 