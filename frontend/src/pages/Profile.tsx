import type React from "react"
import { useState, useEffect } from "react"
import {
  User,
  Settings,
  Bell,
  Phone,
  Heart,
  Calendar,
  Mail,
  UserCircle,
  Plus,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react"
import { useUpdateUserProfile, useUser } from "../hooks/useUser"
import ExportUserDataCall from "../components/ExportUserDataCall"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const Profile = () => {
  const { t } = useTranslation()
  const { data: user, isLoading } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    allergies: [] as string[],
    conditions: [] as string[],
    phone_number: "",
    emergency_contact: {
      name: "",
      relationship: "",
      phone_number: "",
    },
    preferred_reminder_time: ["08:00", "12:00", "18:00"],
    email_notifications_enabled: true,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { mutate: updateProfile, isPending } = useUpdateUserProfile()

  useEffect(() => {
    if (user && !isLoading && !isEditing) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        allergies: user.allergies || [],
        conditions: user.conditions || [],
        phone_number: user.phone_number || "",
        emergency_contact: user.emergency_contact || {
          name: "",
          relationship: "",
          phone_number: "",
        },
        preferred_reminder_time: user.preferred_reminder_time || ["08:00", "12:00", "18:00"],
        email_notifications_enabled: user.email_notifications_enabled ?? true,
      })
    }
  }, [user, isLoading, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    updateProfile(formData, {
      onSuccess: () => {
        setSuccess(t("profile.page.success.message"))
        setIsEditing(false)
      },
      onError: (err: any) => setError(err.message || t("profile.page.error.message")),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith("emergency_contact.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        emergency_contact: {
          ...prev.emergency_contact,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayInput = (e: React.KeyboardEvent<HTMLInputElement>, field: "allergies" | "conditions") => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = (e.target as HTMLInputElement).value.trim()
      if (value) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], value],
        }))
        ;(e.target as HTMLInputElement).value = ""
      }
    }
  }

  const removeArrayItem = (field: "allergies" | "conditions", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile 👤</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100/50 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t("profile.page.title")}</h2>
                  <p className="text-blue-100 text-sm">
                    {isEditing ? "Edit your information below" : "View your personal details"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2 text-sm font-medium rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                  isEditing
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                {isEditing ? (
                  <>{t("profile.page.actions.cancel")}</>
                ) : (
                  <>
                    <Settings className="mr-2 w-4 h-4" />
                    {t("profile.page.actions.edit")}
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4">
              <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t("profile.page.error.title")}</h3>
                    <p className="text-red-100">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t("profile.page.success.title")}</h3>
                    <p className="text-green-100">{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md border border-purple-100/50 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">{t("profile.sections.personal.title")}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.personal.fields.name")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.personal.fields.email")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.personal.fields.date_of_birth")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.personal.fields.gender")}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                    >
                      <option value="">{t("profile.sections.personal.fields.gender_options.select")}</option>
                      <option value="male">{t("profile.sections.personal.fields.gender_options.male")}</option>
                      <option value="female">{t("profile.sections.personal.fields.gender_options.female")}</option>
                      <option value="other">{t("profile.sections.personal.fields.gender_options.other")}</option>
                      <option value="prefer not to say">
                        {t("profile.sections.personal.fields.gender_options.prefer_not_to_say")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-md border border-pink-100/50 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-md">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">{t("profile.sections.medical.title")}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.medical.fields.allergies.label")}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200 shadow-sm"
                        >
                          {allergy}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("allergies", index)}
                              className="ml-1 text-rose-600 hover:text-rose-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                          <Plus className="h-3 w-3 text-rose-500" />
                        </div>
                        <input
                          type="text"
                          placeholder={t("profile.sections.medical.fields.allergies.placeholder")}
                          onKeyDown={(e) => handleArrayInput(e, "allergies")}
                          className="pl-7 w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 bg-white/60 text-xs py-2"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t("profile.sections.medical.fields.conditions.label")}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm"
                        >
                          {condition}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("conditions", index)}
                              className="ml-1 text-amber-600 hover:text-amber-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                          <Plus className="h-3 w-3 text-amber-500" />
                        </div>
                        <input
                          type="text"
                          placeholder={t("profile.sections.medical.fields.conditions.placeholder")}
                          onKeyDown={(e) => handleArrayInput(e, "conditions")}
                          className="pl-7 w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white/60 text-xs py-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-md border border-green-100/50 p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-800">{t("profile.sections.contact.title")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("profile.sections.contact.fields.phone")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("profile.sections.contact.fields.emergency.name")}
                  </label>
                  <input
                    type="text"
                    name="emergency_contact.name"
                    value={formData.emergency_contact.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("profile.sections.contact.fields.emergency.relationship")}
                  </label>
                  <input
                    type="text"
                    name="emergency_contact.relationship"
                    value={formData.emergency_contact.relationship}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("profile.sections.contact.fields.emergency.phone")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="emergency_contact.phone_number"
                      value={formData.emergency_contact.phone_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-sm py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-md border border-indigo-100/50 p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-800">{t("profile.sections.notifications.title")}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-5 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                      formData.email_notifications_enabled
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                        : "bg-gray-300"
                    } ${!isEditing && "opacity-60"}`}
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                        formData.email_notifications_enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <label className="ml-3 block text-sm text-gray-700">
                    {t("profile.sections.notifications.email")}
                  </label>
                  <input
                    type="checkbox"
                    id="email_notifications_enabled"
                    name="email_notifications_enabled"
                    checked={formData.email_notifications_enabled}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email_notifications_enabled: e.target.checked }))
                    }
                    disabled={!isEditing}
                    className="sr-only"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {t("profile.sections.notifications.reminder_times")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["08:00", "12:00", "18:00"].map((time) => (
                      <div
                        key={time}
                        className={`flex items-center p-2 rounded-lg border ${
                          formData.preferred_reminder_time.includes(time)
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
                            : "bg-white/60 border-gray-200"
                        } ${!isEditing && "opacity-75"}`}
                      >
                        <input
                          type="checkbox"
                          id={`time-${time}`}
                          checked={formData.preferred_reminder_time.includes(time)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                preferred_reminder_time: [...prev.preferred_reminder_time, time],
                              }))
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                preferred_reminder_time: prev.preferred_reminder_time.filter((t) => t !== time),
                              }))
                            }
                          }}
                          disabled={!isEditing}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`time-${time}`} className="ml-2 block text-xs text-gray-700">
                          {time}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  aria-busy={isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isPending ? t("profile.page.actions.saving") : t("profile.page.actions.save")}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Privacy Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-5 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold">{t("profile.sections.privacy.title")}</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 text-sm mb-4">{t("profile.sections.privacy.description")}</p>
            <ExportUserDataCall />
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold">{t("profile.sections.subscription.title")}</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">{t("profile.sections.subscription.status")}</h4>
                <p className="text-sm text-gray-600">
                  {user?.subscription?.status === "premium"
                    ? t("profile.sections.subscription.premium")
                    : t("profile.sections.subscription.free")}
                </p>
              </div>
              <Link
                to="/subscription"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                {user?.subscription?.status === "premium"
                  ? t("profile.sections.subscription.manage")
                  : t("profile.sections.subscription.upgrade")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
