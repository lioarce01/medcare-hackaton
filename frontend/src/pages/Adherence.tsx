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

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const { data: adherenceRecords = [], isPending: isRecordsPending, refetch } = useGetAdherenceHistory(formattedDate);
  const { mutate: confirmDose } = useConfirmDose();
  const { mutate: skipDose } = useSkipDose()

  useEffect(() => {
    if (user) return
    refetch()
  }, [selectedDate, user, refetch])

  const handleConfirmDose = (recordId: string) => {
    setProcessingId(recordId);

    confirmDose(recordId, {
      onSettled: () => {
        setProcessingId(null);
      },
    });
  };

  const handleSkipDose = (recordId: string) => {
    setProcessingId(recordId)

    skipDose(recordId, {
      onSettled: () => {
        setProcessingId(null)
      }
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
        return <CheckCircle className="w-5 h-5" />
      case "missed":
        return <XCircle className="w-5 h-5" />
      case "skipped":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const completionRate =
    adherenceRecords.length > 0
      ? Math.round((adherenceRecords.filter((r) => r.status === "taken").length / adherenceRecords.length) * 100)
      : 0

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header with Stats */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {t('adherence.page.title')}
                      </h1>
                      <p className="text-gray-600">{t('adherence.page.subtitle')}</p>
                    </div>
                  </div>

                  {adherenceRecords.length > 0 && (
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${completionRate >= 80 ? "from-emerald-400 to-green-500" : completionRate >= 60 ? "from-yellow-400 to-orange-500" : "from-red-400 to-rose-500"}`}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{completionRate}% {t('adherence.page.overview.overall_adherence')}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {adherenceRecords.filter((r) => r.status === "taken").length} {t('adherence.page.medications.table.taken_doses')} / {adherenceRecords.length} {t('adherence.page.medications.table.total_doses')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Date Navigation */}
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setDate(newDate.getDate() - 1)
                      setSelectedDate(newDate)
                    }}
                    className="p-3 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {t('adherence.page.chart.daily')}
                  </button>

                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setDate(newDate.getDate() + 1)
                      setSelectedDate(newDate)
                    }}
                    className="p-3 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Records Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Date Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-indigo-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{formatDate(selectedDate)}</h2>
                    <p className="text-gray-600">{t('adherence.page.medications.subtitle')}</p>
                  </div>
                </div>
              </div>

              {adherenceRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Pill className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('adherence.page.medications.no_data')}</h3>
                  <p className="text-gray-500">{t('adherence.page.chart.no_data')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {adherenceRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between space-x-4">
                        {/* Medication Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getStatusColor(record.status)} flex items-center justify-center shadow-lg`}
                              >
                                <div className="text-white">{getStatusIcon(record.status)}</div>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                  {record.medication.name}
                                </h3>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">{formatTime(record.scheduled_time)}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 mt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                  {record.medication.dosage.amount} {record.medication.dosage.unit}
                                </span>
                                {record.taken_time && (
                                  <span className="text-sm text-emerald-600 font-medium">
                                    {t('adherence.page.medications.table.taken_doses')} {formatTime(record.taken_time.split("T")[1].slice(0, 5))}
                                  </span>
                                )}
                              </div>

                              {record.medication.instructions && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-xl border-l-4 border-indigo-200">
                                  <p className="text-sm text-gray-600 italic">"{record.medication.instructions}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {record.status === "pending" && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleConfirmDose(record.id)}
                                disabled={processingId === record.id}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t('adherence.page.medications.table.taken_doses')}
                              </button>
                              <button
                                onClick={() => handleSkipDose(record.id)}
                                disabled={processingId === record.id}
                                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-slate-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t('adherence.page.medications.table.missed_doses')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
