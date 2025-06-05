import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, PlusCircle, TrendingUp, Target, Award } from "lucide-react"
import { AdherenceSummary } from "../components/AdherenceSummary"
import { MedicationList } from "../components/MedicationList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { formatTime } from "../lib/formatters"
import { useUser } from "../hooks/useUser"
import { useConfirmDose, useGetAdherenceHistory, useSkipDose } from "../hooks/useAdherence"
import { useActiveMedications } from "../hooks/useMedications"
import { useGetAnalyticsStats } from "../hooks/useAnalytics"
import { useTranslation } from "react-i18next"

interface TodayDose {
  id: string
  medication: {
    id: string
    name: string
    dosage: {
      amount: number
      unit: string
    }
    instructions: string
    imageUrl?: string
  }
  scheduled_time: string
  status: "pending" | "taken" | "skipped"
  taken_time?: string
}

export const Dashboard: React.FC = () => {
  const { data: user } = useUser()
  const [processingDose, setProcessingDose] = useState<string | null>(null)
  const { t } = useTranslation()

  const { mutate: confirmDose } = useConfirmDose()
  const { mutate: skipDose } = useSkipDose()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Solo ejecutar las consultas cuando el usuario esté autenticado
  const {
    data: adherenceRecords = [],
    error: adherenceError,
  } = useGetAdherenceHistory(today)
  const { data: activeMedications = [], error: medsError } = useActiveMedications()
  const { data: analyticsData = [], error: analyticsError } = useGetAnalyticsStats()

  // Si no hay usuario autenticado después de la carga, mostrar mensaje
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <p className="text-indigo-600 font-medium text-lg">{t("dashboard.please_login")}</p>
        </div>
      </div>
    )
  }

  // Solo mostrar errores si el usuario está autenticado
  const error = user ? adherenceError || medsError || analyticsError : null

  const transformedMedications = activeMedications.map((med: any) => ({
    id: med.id,
    userId: med.user_id,
    name: med.name,
    dosage: med.dosage,
    scheduled_times: med.scheduled_times ?? [],
    frequency: med.frequency ?? { times_per_day: 1, specific_days: [] },
    instructions: med.instructions ?? "",
    active: med.active ?? true,
    medication_type: med.medication_type ?? "prescription",
    image_url: med.image_url ?? "",
    createdAt: med.created_at,
    updatedAt: med.updated_at,
    start_date: med.start_date,
    end_date: med.end_date,
    refill_reminder: med.refill_reminder ?? {
      enabled: false,
      threshold: 0,
      last_refill: null,
      next_refill: null,
      supply_amount: 0,
      supply_unit: "",
    },
    side_effects_to_watch: med.side_effects_to_watch ?? [],
  }))

  // Use adherenceRecords as todayDoses
  const todayDoses: TodayDose[] = adherenceRecords.map((record: any) => ({
    id: record.id,
    medication: {
      id: record.medication?.id || "",
      name: record.medication?.name || "",
      dosage: record.medication?.dosage || { amount: 0, unit: "" },
      instructions: record.medication?.instructions || "",
      imageUrl: record.medication?.image_url || record.medication?.imageUrl,
    },
    scheduled_time: record.scheduled_time,
    status: record.status,
    taken_time: record.taken_time,
  }))

  const stats = analyticsData.reduce(
    (acc: any, record: any) => {
      acc.total++
      if (record.status === "taken") acc.taken++
      if (record.status === "skipped") acc.skipped++
      return acc
    },
    { total: 0, taken: 0, skipped: 0 },
  )

  const adherenceStats = {
    overall: {
      ...stats,
      adherenceRate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0,
    },
  }

  const handleConfirmDose = (recordId: string) => {
    setProcessingDose(recordId)

    confirmDose(recordId, {
      onSettled: () => {
        setProcessingDose(null)
      },
    })
  }

  const handleSkipDose = (recordId: string) => {
    setProcessingDose(recordId)

    skipDose(recordId, {
      onSettled: () => {
        setProcessingDose(null)
      },
    })
  }

  // Get pending doses
  const pendingDoses = todayDoses.filter((dose) => dose.status === "pending")
  const upcomingDoses = [...pendingDoses].sort((a, b) => {
    return a.scheduled_time.localeCompare(b.scheduled_time)
  })

  // Get taken, skipped, and skipped doses
  const completedDoses = todayDoses.filter((dose) => dose.status !== "pending")

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("dashboard.greetings.morning")
    if (hour < 17) return t("dashboard.greetings.afternoon")
    return t("dashboard.greetings.evening")
  }

  const getTodayProgress = () => {
    const total = todayDoses.length
    const completed = todayDoses.filter((dose) => dose.status === "taken").length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const nextDose = upcomingDoses[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {getGreeting()}, {user?.name || "there"}! 👋
              </h1>
              <p className="text-gray-600">
                {upcomingDoses.length > 0
                  ? t("dashboard.header.medications_scheduled", {
                      count: upcomingDoses.length,
                      plural: upcomingDoses.length === 1 ? "" : "s",
                    })
                  : t("dashboard.header.all_completed")}
              </p>
            </div>
            <Link
              to="/medications/add"
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <PlusCircle className="mr-2 group-hover:rotate-90 transition-transform duration-300" size={20} />
              {t("dashboard.header.add_medication")}
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-lg animate-pulse">
              <div className="flex items-center">
                <AlertCircle className="mr-3" size={24} />
                {(error as Error)?.message || "Unexpected error"}
              </div>
            </div>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t("dashboard.stats.today_progress")}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {getTodayProgress()}%
                  </p>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <Target className="text-blue-600" size={28} />
                </div>
              </div>
              <div className="mt-4 bg-blue-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getTodayProgress()}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t("dashboard.stats.overall_adherence")}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {Math.round(adherenceStats.overall.adherenceRate)}%
                  </p>
                </div>
                <div className="p-4 bg-green-500/20 rounded-2xl">
                  <TrendingUp className="text-green-600" size={28} />
                </div>
              </div>
              <p className="text-sm text-green-700 mt-3 font-medium">
                {t("dashboard.stats.doses_taken", {
                  taken: adherenceStats.overall.taken,
                  total: adherenceStats.overall.total,
                })}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t("dashboard.stats.active_medications")}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {transformedMedications.length}
                  </p>
                </div>
                <div className="p-4 bg-purple-500/20 rounded-2xl">
                  <Award className="text-purple-600" size={28} />
                </div>
              </div>
              <p className="text-sm text-purple-700 mt-3 font-medium">{t("dashboard.stats.currently_managing")}</p>
            </div>
          </div>

          {/* Next Dose Alert */}
          {nextDose && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white border border-blue-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <Clock className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{t("dashboard.next_dose.title")}</h3>
                    <p className="text-blue-100 text-lg">
                      {nextDose.medication.name} • {formatTime(nextDose.scheduled_time)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleConfirmDose(nextDose.id)}
                  disabled={processingDose === nextDose.id}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {processingDose === nextDose.id ? <LoadingSpinner /> : t("dashboard.next_dose.take_now")}
                </button>
              </div>
            </div>
          )}

          {/* Adherence Summary */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100/50">
            <AdherenceSummary
              adherenceRate={Math.round(adherenceStats.overall.adherenceRate)}
              totalDoses={adherenceStats.overall.total}
              takenDoses={adherenceStats.overall.taken}
              streakDays={0}
            />
          </div>

          {/* Today's Schedule */}
          <section className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
            <div className="p-8 border-b border-purple-100/50">
              <div className="flex items-center">
                <Calendar className="mr-4 text-purple-600" size={28} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t("dashboard.schedule.title")}
                </h2>
              </div>
            </div>

            <div className="p-8">
              {upcomingDoses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-6 bg-green-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <p className="text-gray-700 text-xl font-bold mb-2">{t("dashboard.schedule.all_completed.title")}</p>
                  <p className="text-gray-500 text-lg">{t("dashboard.schedule.all_completed.subtitle")}</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingDoses.map((dose) => (
                    <div
                      key={dose.id}
                      className="group bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-5">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {dose.medication.name}
                          </h3>
                          <div className="flex items-center text-blue-600 bg-blue-100 px-4 py-2 rounded-xl">
                            <Clock className="mr-2" size={18} />
                            <span className="font-semibold">{formatTime(dose.scheduled_time)}</span>
                          </div>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium text-lg bg-blue-50 px-4 py-2 rounded-xl">
                              {dose.medication.dosage.amount} {dose.medication.dosage.unit}
                            </span>
                          </div>

                          {dose.medication.instructions && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                              <p className="text-gray-600 italic">
                                {t("dashboard.schedule.medication.instructions", {
                                  instructions: dose.medication.instructions,
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleConfirmDose(dose.id)}
                            disabled={processingDose === dose.id}
                            className="flex-1 py-3 px-4 bg-green-100 text-green-600 hover:bg-green-200 rounded-xl transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {processingDose === dose.id ? (
                              <LoadingSpinner />
                            ) : (
                              <>
                                <CheckCircle size={20} className="mr-2" />
                                Take
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSkipDose(dose.id)}
                            disabled={processingDose === dose.id}
                            className="flex-1 py-3 px-4 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {processingDose === dose.id ? (
                              <LoadingSpinner />
                            ) : (
                              <>
                                <XCircle size={20} className="mr-2" />
                                Skip
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Completed Doses */}
          {completedDoses.length > 0 && (
            <section className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl border border-green-100/50 overflow-hidden">
              <div className="p-8 border-b border-green-100/50">
                <div className="flex items-center">
                  <CheckCircle className="mr-4 text-green-600" size={28} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {t("dashboard.completed.title")}
                  </h2>
                  <span className="ml-4 bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-medium">
                    {completedDoses.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider rounded-l-xl">
                        {t("dashboard.completed.table.medication")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {t("dashboard.completed.table.scheduled_time")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider rounded-r-xl">
                        {t("dashboard.completed.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {completedDoses.map((dose, index) => (
                      <tr
                        key={dose.id}
                        className={`hover:bg-green-50 transition-colors ${index === completedDoses.length - 1 ? "rounded-b-xl overflow-hidden" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{dose.medication.name}</div>
                          <div className="text-sm text-gray-500">
                            {dose.medication.dosage.amount} {dose.medication.dosage.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                          {formatTime(dose.scheduled_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dose.status === "taken" ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="mr-2" size={16} />
                              {t("dashboard.completed.table.taken")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-800">
                              <XCircle className="mr-2" size={16} />
                              {t("dashboard.completed.table.skipped")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Your Medications */}
          <section className="bg-gradient-to-br from-white to-pink-50 rounded-3xl shadow-xl border border-pink-100/50 overflow-hidden">
            <div className="p-8 border-b border-pink-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PlusCircle className="mr-4 text-pink-600" size={28} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {t("dashboard.medications.title")}
                  </h2>
                  <span className="ml-4 bg-pink-100 text-pink-800 px-4 py-2 rounded-xl text-sm font-medium">
                    {transformedMedications.length}
                  </span>
                </div>
                <Link
                  to="/medications"
                  className="bg-pink-100 text-pink-700 hover:bg-pink-200 px-5 py-2 rounded-xl font-medium text-sm transition-colors flex items-center"
                >
                  {t("dashboard.medications.view_all")}
                </Link>
              </div>
            </div>

            <div className="p-8">
              <MedicationList medications={transformedMedications} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
