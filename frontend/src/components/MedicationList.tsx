import React, { useCallback } from "react"
import { Link } from "react-router-dom"
import { Pill, Heart } from "lucide-react"
import { useTranslation } from "react-i18next"
import MedicationCard from "./MedicationCard"
import type { MedicationListProps } from "../types/medication_types"

// Memoize the empty state component
const EmptyMedicationList = React.memo(() => {
  const { t } = useTranslation()

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
        <Pill className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{t("medications.list.empty.title")}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">{t("medications.list.empty.message")}</p>
      <Link
        to="/medications/add"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg"
      >
        <Heart className="w-6 h-6" />
        {t("medications.list.empty.add_first")}
      </Link>
    </div>
  )
})

// Main component with React.memo
export const MedicationList: React.FC<MedicationListProps> = React.memo(({ medications, onDelete }) => {
  const handleDelete = useCallback(
    (id: string) => {
      if (onDelete) {
        onDelete(id)
      }
    },
    [onDelete],
  )

  if (medications.length === 0) {
    return <EmptyMedicationList />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {medications.map((medication, index) => (
        <MedicationCard key={medication.id} medication={medication} onDelete={handleDelete} index={index} />
      ))}
    </div>
  )
})
