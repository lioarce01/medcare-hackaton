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
  Crown,
  CreditCard,
  Clock,
  Star,
  ArrowRight,
  Download,
  Lock,
  BarChart3,
} from "lucide-react"
import { useUpdateUserProfile, useUser } from "../hooks/useUser"
import ExportUserDataCall from "../components/ExportUserDataCall"
import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ReminderSettings } from "../components/reminders/ReminderSettings"
import { Link } from "react-router-dom"

export const Profile = () => {
  const { t } = useTranslation()
  const { data: user, isLoading } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
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
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-md border border-gray-100">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Personal</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Reminders</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{t("profile.page.title")}</h2>
                      <p className="text-blue-100 text-xs">
                        {isEditing ? "Edit your information below" : "View your personal details"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
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
                <div className="mx-5 mt-4">
                  <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl p-3 shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{t("profile.page.error.title")}</h3>
                        <p className="text-red-100 text-xs">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mx-5 mt-4">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl p-3 shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{t("profile.page.success.title")}</h3>
                        <p className="text-green-100 text-xs">{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md border border-purple-100/50 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm">{t("profile.sections.personal.title")}</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("profile.sections.personal.fields.name")}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <UserCircle className="h-3 w-3 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("profile.sections.personal.fields.email")}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Mail className="h-3 w-3 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("profile.sections.personal.fields.date_of_birth")}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
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
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
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
                  <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md border border-pink-100/50 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-md">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm">{t("profile.sections.medical.title")}</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {t("profile.sections.medical.fields.allergies.label")}
                        </label>
                        <div className="flex flex-wrap gap-1 mb-2">
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
                        <div className="flex flex-wrap gap-1 mb-2">
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
                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md border border-green-100/50 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-md">
                      <Phone className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{t("profile.sections.contact.title")}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("profile.sections.contact.fields.phone")}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Phone className="h-3 w-3 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
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
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
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
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("profile.sections.contact.fields.emergency.phone")}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Phone className="h-3 w-3 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="emergency_contact.phone_number"
                          value={formData.emergency_contact.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60 text-xs py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      aria-busy={isPending}
                      className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isPending ? t("profile.page.actions.saving") : t("profile.page.actions.save")}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <ReminderSettings />
          </TabsContent>

          <TabsContent value="subscription">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Subscription</h2>
                    <p className="text-blue-100 text-xs">Manage your subscription plan</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {user?.subscription_status === "premium" ? (
                  <div className="space-y-5">
                    {/* Premium Status Card */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-300" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Premium Plan</h3>
                            <p className="text-purple-100 text-sm">You're enjoying all premium features</p>
                          </div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="grid grid-cols-2 gap-4">

                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-purple-100">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <h3 className="font-medium text-sm">Plan Details</h3>
                        </div>
                        <p className="text-gray-600 text-xs mb-1">Expires on:</p>
                        <p className="font-medium text-sm">
                          {user.subscription_expires_at
                            ? new Date(user.subscription_expires_at).toLocaleDateString()
                            : "Not available"}
                        </p>
                        <p className="text-gray-600 text-xs mt-2">Billing cycle:</p>
                        <p className="font-medium text-sm">Monthly</p>
                      </div>

                      {/* Premium Features */}
                      <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-md border border-purple-100">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <h3 className="font-medium text-sm">Your Premium Benefits</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Unlimited reminders",
                            "Custom notifications",
                            "Export Data PDF",
                            "Custom Reminders"
                          ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center">
                        <CreditCard className="mr-2 w-4 h-4" />
                        Update Payment Method
                      </button>
                      <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Free Plan Status */}
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-4 text-white shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Free Plan</h3>
                            <p className="text-gray-200 text-sm">You're on the basic plan</p>
                          </div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <span className="text-xs font-medium">Limited</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium Benefits */}
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-md border border-purple-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Crown className="w-4 h-4 text-purple-500" />
                        <h3 className="font-medium text-sm">Upgrade to Premium</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {[
                          {
                            title: "Unlimited Reminders",
                            description: "Create as many reminders as you need",
                            icon: Bell,
                          },
                          {
                            title: "Priority Support",
                            description: "Get help when you need it most",
                            icon: CheckCircle,
                          },
                          {
                            title: "Advanced Analytics",
                            description: "Detailed insights into your medication adherence",
                            icon: BarChart3,
                          },
                          {
                            title: "Family Sharing",
                            description: "Manage medications for your loved ones",
                            icon: Heart,
                          },
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="bg-white/70 rounded-lg p-3 border border-purple-100 flex items-start space-x-2"
                          >
                            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm flex-shrink-0">
                              <feature.icon className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-xs text-gray-800">{feature.title}</h4>
                              <p className="text-gray-600 text-xs">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 mb-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">Monthly subscription</p>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-purple-700">$9.99</span>
                              <span className="text-xs text-gray-600 ml-1">/month</span>
                            </div>
                          </div>
                          <div className="bg-white px-2 py-1 rounded-lg text-xs font-medium text-purple-700 border border-purple-200">
                            Save 20% annually
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Button */}
                      <Link
                        to="/subscription"
                        className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
                      >
                        <Crown className="mr-2 w-4 h-4" />
                        Upgrade to Premium
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-5 text-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{t("profile.sections.privacy.title")}</h2>
                    <p className="text-gray-200 text-xs">Manage your privacy settings and data</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-gray-600 text-sm">{t("profile.sections.privacy.description")}</p>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Download className="w-4 h-4 text-gray-700" />
                    <h3 className="font-medium text-sm">Export Your Data</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Download a copy of all your personal data stored in our system. This includes your profile
                    information, medication history, and adherence records.
                  </p>
                  <ExportUserDataCall />
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-700" />
                    <h3 className="font-medium text-sm">Privacy Settings</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Analytics Tracking</p>
                        <p className="text-xs text-gray-500">Allow us to collect anonymous usage data</p>
                      </div>
                      <div className="w-10 h-5 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer">
                        <div className="bg-white w-3 h-3 rounded-full shadow-md transform translate-x-5"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Marketing</p>
                        <p className="text-xs text-gray-500">Receive promotional emails and updates</p>
                      </div>
                      <div className="w-10 h-5 rounded-full p-1 bg-gray-300 cursor-pointer">
                        <div className="bg-white w-3 h-3 rounded-full shadow-md"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all duration-200">
                    Delete Account
                  </button>

                  <button className="px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg">
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
