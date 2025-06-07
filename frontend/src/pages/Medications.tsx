import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Pill,
  Activity,
  Pause,
  ChevronDown,
  Sparkles,
  Calendar,
  Clock,
  Heart,
} from "lucide-react"
import { MedicationList } from "../components/MedicationList"
import { useUser } from "../hooks/useUser"
import { useDeleteMedication, useMedications } from "../hooks/useMedications"
import { useTranslation } from "react-i18next"
import type { Medication } from "../types/medication_types"
import { LoadingSpinner } from "../components/LoadingSpinner"

type FilterType = "all" | "active" | "inactive"

const filterMedications = (medications: Medication[], filter: FilterType, searchTerm: string): Medication[] => {
  return medications
    .filter((med) => {
      if (filter === "active") return med.active
      if (filter === "inactive") return !med.active
      return true
    })
    .filter((med) => {
      const search = searchTerm.toLowerCase()
      const nameMatch = med.name.toLowerCase().includes(search)
      const dosage = `${med.dosage.amount} ${med.dosage.unit}`
      const dosageMatch = dosage.toLowerCase().includes(search)
      return nameMatch || dosageMatch
    })
}

export const Medications = () => {
  const { data: user, isLoading: isUserLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const { t } = useTranslation()

  const { data: medicationsData, isError, error, refetch, isLoading } = useMedications()
  const { mutate: deleteMedication } = useDeleteMedication()

  const filteredMedications = useMemo(() => {
    if (!medicationsData?.all) return []
    return filterMedications(medicationsData.all, filter, searchTerm)
  }, [medicationsData?.all, filter, searchTerm])

  useEffect(() => {
    if (!isUserLoading) refetch()
  }, [isUserLoading, refetch])

  const handleDelete = (id: string) => deleteMedication(id)

  const handleRefresh = async () => {
    await refetch({ throwOnError: true })
  }

  if (isUserLoading || isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t("medications.page.auth_required.title")}</h2>
          <p className="text-gray-600 mb-6 text-sm">{t("medications.page.auth_required.message")}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <Heart className="w-4 h-4" />
            {t("medications.page.auth_required.sign_in")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center py-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Medication Library 💊</h1>
            <p className="text-gray-600 text-sm">Managing your health, one medication at a time</p>
          </div>

          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1">{t("medications.page.title")}</h2>
                  <p className="text-purple-100 text-sm">{t("medications.page.subtitle")}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 font-medium group backdrop-blur-sm text-sm"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
                    }`}
                  />
                  {isLoading ? t("medications.page.actions.refreshing") : t("medications.page.actions.refresh")}
                </button>
                <Link
                  to="/medications/add"
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg font-medium hover:bg-purple-50 text-sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("medications.page.actions.add_medication")}
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Error Alert */}
          {isError && (
            <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{t("medications.page.error.title")}</h3>
                    <p className="text-red-100 text-sm">{(error as Error)?.message || "Unexpected error"}</p>
                  </div>
                </div>
                <button
                  onClick={() => refetch()}
                  className="bg-white text-red-600 px-3 py-1 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                  title={t("medications.page.error.retry")}
                >
                  {t("medications.page.error.retry")}
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Search and Filter Controls */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                <h3 className="text-lg font-bold">Find Your Medications</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {t("medications.page.search.label")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("medications.page.search.placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Filter */}
                <div className="lg:w-64">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {t("medications.page.filter.label")}
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all duration-200 font-medium"
                    >
                      <option value="all">{t("medications.page.filter.all")}</option>
                      <option value="active">{t("medications.page.filter.active")}</option>
                      <option value="inactive">{t("medications.page.filter.inactive")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {(searchTerm || filter !== "all") && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                    <p className="text-gray-700 font-medium text-sm">
                      {t("medications.page.results.summary", {
                        filtered: filteredMedications.length,
                        total: medicationsData?.all.length,
                      })}
                      {searchTerm && <span> {t("medications.page.results.matching", { term: searchTerm })}</span>}
                      {filter !== "all" && (
                        <span> {t("medications.page.results.filtered_by", { status: filter })}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Medications List */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
            {filteredMedications.length === 0 ? (
              <div className="p-12 text-center">
                {medicationsData?.all.length === 0 ? (
                  // No medications at all
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl shadow-md flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                      <Pill className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t("medications.page.empty.title")}</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{t("medications.page.empty.message")}</p>
                    <Link
                      to="/medications/add"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg font-medium"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      {t("medications.page.empty.add_first")}
                    </Link>
                  </>
                ) : (
                  // No results for current filter/search
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      <Search className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {t("medications.page.empty.no_results.title")}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? t("medications.page.empty.no_results.search_message", { term: searchTerm })
                        : t("medications.page.empty.no_results.filter_message", { status: filter })}
                    </p>
                    {(searchTerm || filter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setFilter("all")
                        }}
                        className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {t("medications.page.empty.no_results.clear_filters")}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="p-5">
                <MedicationList medications={filteredMedications} onDelete={handleDelete} />
              </div>
            )}
          </div>

          {/* Enhanced Stats Summary */}
          {medicationsData?.all && medicationsData.all.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: t("medications.page.stats.total"),
                  value: medicationsData.all.length,
                  icon: Pill,
                  gradient: "from-blue-400 to-cyan-500",
                  emoji: "💊",
                },
                {
                  title: t("medications.page.stats.active"),
                  value: medicationsData.all.filter((med) => med.active).length,
                  icon: Activity,
                  gradient: "from-green-400 to-emerald-500",
                  emoji: "✅",
                },
                {
                  title: t("medications.page.stats.inactive"),
                  value: medicationsData.all.filter((med) => !med.active).length,
                  icon: Pause,
                  gradient: "from-orange-400 to-red-500",
                  emoji: "⏸️",
                },
              ].map((stat, index) => (
                <div
                  key={stat.title}
                  className={`bg-gradient-to-br ${stat.gradient} text-white rounded-2xl shadow-lg p-4 transform transition-all duration-300 hover:-translate-y-1`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-6 h-6" />
                    <span className="text-2xl">{stat.emoji}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/90 font-medium text-sm">{stat.title}</div>
                </div>
              ))}
            </div>
          )}

          {/* Daily Schedule Preview */}
          {medicationsData?.all && medicationsData.all.length > 0 && (
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg text-white">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{t("medications.page.schedule.title")}</h3>
                    <p className="text-green-100 text-sm">{t("medications.page.schedule.subtitle")}</p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">
                        {t("medications.page.schedule.active_count", {
                          count: medicationsData.all.filter((med) => med.active).length,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Footer */}
          <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-2xl shadow-lg p-5 text-center">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-lg font-bold mb-2">Keep up the amazing work!</h3>
            <p className="text-pink-100">
              Every medication you manage is a step towards better health. You're doing fantastic!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
