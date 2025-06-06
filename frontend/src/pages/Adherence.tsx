import type React from "react"
import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pill,
  TrendingUp,
} from "lucide-react"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { formatTime, formatDate } from "../lib/formatters"
import { useUser } from "../hooks/useUser"
import { useConfirmDose, useGetAdherenceHistory, useSkipDose } from "../hooks/useAdherence"
import { useTranslation } from "react-i18next"

export const Adherence: React.FC = () => {
  const { t } = useTranslation()
  const { data: user } = useUser()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [processingId, setProcessingId] = useState<string | null>(null)

  const formattedDate = selectedDate.toISOString().split("T")[0]

  const { data: adherenceRecords = [], isPending: isRecordsPending, refetch } = useGetAdherenceHistory(formattedDate)
  const { mutate: confirmDose } = useConfirmDose()
  const { mutate: skipDose } = useSkipDose()

  useEffect(() => {
    if (user) return
    refetch()
  }, [selectedDate, user, refetch])

  const handleConfirmDose = (recordId: string) => {
    setProcessingId(recordId)

    confirmDose(recordId, {
      onSettled: () => {
        setProcessingId(null)
      },
    })
  }

  const handleSkipDose = (recordId: string) => {
    setProcessingId(recordId)

    skipDose(recordId, {
      onSettled: () => {
        setProcessingId(null)
      },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "from-emerald-400 to-green-500"
      case "missed":
        return "from-red-400 to-rose-500"
      case "skipped":
        return "from-gray-400 to-slate-500"
      default:
        return "from-blue-400 to-indigo-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="w-4 h-4" />
      case "missed":
        return <XCircle className="w-4 h-4" />
      case "skipped":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "taken":
        return "✅"
      case "missed":
        return "❌"
      case "skipped":
        return "⏸️"
      default:
        return "⏰"
    }
  }

  const completionRate =
    adherenceRecords.length > 0
      ? Math.round((adherenceRecords.filter((r) => r.status === "taken").length / adherenceRecords.length) * 100)
      : 0

  const getMotivationalMessage = (rate: number) => {
    if (rate >= 90) return "🌟 Outstanding! You're a medication superstar!"
    if (rate >= 80) return "💪 Excellent work! Keep up the great momentum!"
    if (rate >= 70) return "👍 Good progress! You're doing well!"
    if (rate >= 50) return "🌱 Making progress! Every dose counts!"
    return "💙 Starting your journey! You've got this!"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-5">
          {/* Header Section */}
          <div className="text-center py-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Adherence Journey 📊</h1>
            <p className="text-gray-600 text-sm">Track your progress and celebrate your commitment to health</p>
          </div>

          {/* Enhanced Header with Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold mb-1">{t("adherence.page.title")}</h2>
                      <p className="text-blue-100 text-sm">{t("adherence.page.subtitle")}</p>
                    </div>
                  </div>

                  {adherenceRecords.length > 0 && (
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xl font-bold mb-1">{completionRate}%</div>
                          <p className="text-blue-100 text-xs">{t("adherence.page.overview.overall_adherence")}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">
                            {completionRate >= 80 ? "🎯" : completionRate >= 60 ? "⭐" : "💫"}
                          </div>
                          <div className="text-xs text-blue-100">
                            {adherenceRecords.filter((r) => r.status === "taken").length} / {adherenceRecords.length}{" "}
                            doses
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-100 mt-2 text-center text-xs">{getMotivationalMessage(completionRate)}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Date Navigation */}
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setDate(newDate.getDate() - 1)
                      setSelectedDate(newDate)
                    }}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 group"
                  >
                    <ChevronLeft className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-2 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm"
                  >
                    {t("adherence.page.chart.daily")}
                  </button>

                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setDate(newDate.getDate() + 1)
                      setSelectedDate(newDate)
                    }}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 group"
                  >
                    <ChevronRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Records Container */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
            {/* Date Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{formatDate(selectedDate)}</h3>
                  <p className="text-indigo-100 text-sm">{t("adherence.page.medications.subtitle")}</p>
                </div>
              </div>
            </div>

            {adherenceRecords.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl mb-3">📅</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t("adherence.page.medications.no_data")}</h3>
                <p className="text-gray-600 text-sm">{t("adherence.page.chart.no_data")}</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid gap-3">
                  {adherenceRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between space-x-3">
                          {/* Medication Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor(
                                    record.status,
                                  )} flex items-center justify-center shadow-md`}
                                >
                                  <div className="text-white">{getStatusIcon(record.status)}</div>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                      {record.medication.name}
                                    </h3>
                                    <span className="text-lg">{getStatusEmoji(record.status)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                                    <Clock className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600">
                                      {formatTime(record.scheduled_time)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                                    💊 {record.medication.dosage.amount} {record.medication.dosage.unit}
                                  </span>
                                  {record.taken_time && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200">
                                      ✅ Taken at {formatTime(record.taken_time.split("T")[1].slice(0, 5))}
                                    </span>
                                  )}
                                </div>

                                {record.medication.instructions && (
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-2 border-l-4 border-blue-400">
                                    <p className="text-xs text-gray-700 italic font-medium">
                                      💡 "{record.medication.instructions}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {record.status === "pending" && (
                              <div className="flex items-center space-x-2 pt-2">
                                <button
                                  onClick={() => handleConfirmDose(record.id)}
                                  disabled={processingId === record.id}
                                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm"
                                >
                                  {processingId === record.id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-1 w-3 h-3" />
                                      Mark as Taken
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleSkipDose(record.id)}
                                  disabled={processingId === record.id}
                                  className="flex-1 py-2 px-3 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-lg font-bold hover:from-gray-600 hover:to-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm"
                                >
                                  {processingId === record.id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <>
                                      <XCircle className="mr-1 w-3 h-3" />
                                      Skip Dose
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Motivational Footer */}
          {adherenceRecords.length > 0 && (
            <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-2xl shadow-lg p-4 text-center">
              <div className="text-2xl mb-2">🌟</div>
              <h3 className="text-lg font-bold mb-2">
                {completionRate >= 80 ? "You're doing amazing!" : "Keep up the great work!"}
              </h3>
              <p className="text-pink-100 text-sm">
                {completionRate >= 80
                  ? "Your dedication to your health is truly inspiring. You're setting a fantastic example!"
                  : "Every medication you take is a step towards better health. You're making great progress!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
