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
import { formatTime, formatDate } from "../utils/formatters"
import { useUser } from "../hooks/useUser"
import { useConfirmDose, useGetAdherenceHistory, useSkipDose } from "../hooks/useAdherence"

export const Adherence: React.FC = () => {
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

  if (isRecordsPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-indigo-600 font-medium">Loading your medication history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                        Adherence History
                      </h1>
                      <p className="text-gray-600">Track your medication journey</p>
                    </div>
                  </div>

                  {adherenceRecords.length > 0 && (
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${completionRate >= 80 ? "from-emerald-400 to-green-500" : completionRate >= 60 ? "from-yellow-400 to-orange-500" : "from-red-400 to-rose-500"}`}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{completionRate}% completion rate</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {adherenceRecords.filter((r) => r.status === "taken").length} of {adherenceRecords.length} doses
                        taken
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
                    Today
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

          {/* Enhanced Error Message */}
          {/* {error && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Something went wrong</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

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
                    <p className="text-gray-600">Medication schedule</p>
                  </div>
                </div>
              </div>

              {adherenceRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Pill className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No medications scheduled</h3>
                  <p className="text-gray-500">No medication records found for this date.</p>
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
                                    Taken at {formatTime(record.taken_time.split("T")[1].slice(0, 5))}
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

                          {/* Status and Actions */}
                          <div className="flex items-center justify-between pl-16">
                            <div>
                              {record.status === "taken" ? (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 shadow-sm">
                                  <CheckCircle className="mr-2 w-4 h-4" />
                                  Completed
                                </span>
                              ) : record.status === "missed" ? (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 shadow-sm">
                                  <XCircle className="mr-2 w-4 h-4" />
                                  Missed
                                </span>
                              ) : record.status === "skipped" ? (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 shadow-sm">
                                  <AlertCircle className="mr-2 w-4 h-4" />
                                  Skipped
                                </span>
                              ) : (
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleConfirmDose(record.id)}
                                    disabled={processingId === record.id}
                                    className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                                  >
                                    {processingId === record.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    ) : (
                                      <CheckCircle className="mr-2 w-4 h-4" />
                                    )}
                                    Take Dose
                                  </button>
                                  <button
                                    onClick={() => handleSkipDose(record.id)}
                                    disabled={processingId === record.id}
                                    className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 disabled:opacity-50"
                                  >
                                    <XCircle className="mr-2 w-4 h-4" />
                                    Skip
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
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
