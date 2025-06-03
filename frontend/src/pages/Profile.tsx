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
  Loader2,
} from "lucide-react"
import { useUpdateUserProfile, useUser } from "../hooks/useUser"

export const Profile = () => {
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
    // Solo actualizar formData cuando tenemos datos del usuario y no estamos en modo edición
    if (user && !isLoading && !isEditing) {
      console.log('User data received:', user); // Para debugging
      
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
      });
    }
  }, [user, isLoading, isEditing]);

// También agrega este useEffect adicional para debugging:
useEffect(() => {
  console.log('Component state:', {
    user,
    isLoading,
    isEditing,
    formData: formData.name // Solo logear el nombre para ver si se está actualizando
  });
}, [user, isLoading, isEditing, formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    updateProfile(formData, {
    onSuccess: () => {
      setSuccess("Profile updated successfully")
      setIsEditing(false) 
    },
    onError: (err: any) => setError(err.message || "Failed to update profile"),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <p className="text-indigo-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Profile Settings
                  </h1>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-3 text-sm font-medium rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
                    isEditing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <span className="mr-2">Cancel</span>
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-8 mt-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800">Error occurred</h3>
                        <p className="text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mx-8 mt-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-10"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Success</h3>
                        <p className="text-green-600">{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <UserCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 bg-white/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 bg-white/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 bg-white/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 bg-white/60"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-md">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Medical Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200 shadow-sm"
                          >
                            {allergy}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeArrayItem("allergies", index)}
                                className="ml-2 text-rose-600 hover:text-rose-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="relative mt-2">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Plus className="h-4 w-4 text-rose-500" />
                          </div>
                          <input
                            type="text"
                            placeholder="Press Enter to add allergy"
                            onKeyDown={(e) => handleArrayInput(e, "allergies")}
                            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 bg-white/60"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm"
                          >
                            {condition}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeArrayItem("conditions", index)}
                                className="ml-2 text-amber-600 hover:text-amber-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="relative mt-2">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Plus className="h-4 w-4 text-amber-500" />
                          </div>
                          <input
                            type="text"
                            placeholder="Press Enter to add condition"
                            onKeyDown={(e) => handleArrayInput(e, "conditions")}
                            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white/60"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl opacity-5"></div>
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                          <input
                            type="text"
                            name="emergency_contact.name"
                            value={formData.emergency_contact.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <input
                            type="text"
                            name="emergency_contact.relationship"
                            value={formData.emergency_contact.relationship}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Contact Phone
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              name="emergency_contact.phone_number"
                              value={formData.emergency_contact.phone_number}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-50 bg-white/60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="pt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Notification Settings</h2>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl opacity-5"></div>
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                            formData.email_notifications_enabled
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                              : "bg-gray-300"
                          } ${!isEditing && "opacity-60"}`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                              formData.email_notifications_enabled ? "translate-x-6" : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                        <label className="ml-3 block text-sm text-gray-700">
                          Enable email notifications for medication reminders
                        </label>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotificationsEnabled"
                          checked={formData.email_notifications_enabled}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email_notifications_enabled: e.target.checked }))
                          }
                          disabled={!isEditing}
                          className="sr-only"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Reminder Times</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {["08:00", "12:00", "18:00"].map((time) => (
                            <div
                              key={time}
                              className={`flex items-center p-3 rounded-xl border ${
                                formData.preferred_reminder_time.includes(time)
                                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200"
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
                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`time-${time}`} className="ml-3 block text-sm text-gray-700">
                                {time}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    aria-busy={isPending}
                    className="px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
