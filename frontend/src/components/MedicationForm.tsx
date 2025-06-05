import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface MedicationFormData {
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

interface MedicationFormProps {
  initialData?: MedicationFormData
  onSubmit: (data: MedicationFormData) => void
  isSubmitting?: boolean
}

export const MedicationForm: React.FC<MedicationFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<MedicationFormData>(
    initialData || {
      name: "",
      dosage: {
        amount: 0,
        unit: "mg",
      },
      scheduled_times: [],
      frequency: {
        times_per_day: 1,
        specific_days: [],
      },
      instructions: "",
      active: true,
      medication_type: "prescription",
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MedicationFormData] as Record<string, any>),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MedicationFormData] as Record<string, any>),
          [child]: Number(value),
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t("medications.form.name.label")}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dosage.amount" className="block text-sm font-medium text-gray-700">
            {t("medications.form.dosage.amount.label")}
          </label>
          <input
            type="number"
            id="dosage.amount"
            name="dosage.amount"
            value={formData.dosage.amount}
            onChange={handleNumberChange}
            required
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dosage.unit" className="block text-sm font-medium text-gray-700">
            {t("medications.form.dosage.unit.label")}
          </label>
          <select
            id="dosage.unit"
            name="dosage.unit"
            value={formData.dosage.unit}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="mg">{t("medications.form.dosage.unit.mg")}</option>
            <option value="g">{t("medications.form.dosage.unit.g")}</option>
            <option value="ml">{t("medications.form.dosage.unit.ml")}</option>
            <option value="tablet">{t("medications.form.dosage.unit.tablet")}</option>
            <option value="capsule">{t("medications.form.dosage.unit.capsule")}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="medication_type" className="block text-sm font-medium text-gray-700">
          {t("medications.form.type.label")}
        </label>
        <select
          id="medication_type"
          name="medication_type"
          value={formData.medication_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="prescription">{t("medications.form.type.prescription")}</option>
          <option value="over-the-counter">{t("medications.form.type.over_the_counter")}</option>
          <option value="vitamin">{t("medications.form.type.vitamin")}</option>
          <option value="supplement">{t("medications.form.type.supplement")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="frequency.times_per_day" className="block text-sm font-medium text-gray-700">
          {t("medications.form.frequency.times_per_day.label")}
        </label>
        <input
          type="number"
          id="frequency.times_per_day"
          name="frequency.times_per_day"
          value={formData.frequency.times_per_day}
          onChange={handleNumberChange}
          required
          min="1"
          max="24"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
          {t("medications.form.instructions.label")}
        </label>
        <textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          {t("medications.form.active.label")}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? t("medications.form.submitting")
            : initialData
            ? t("medications.form.update")
            : t("medications.form.create")}
        </button>
      </div>
    </form>
  )
} 