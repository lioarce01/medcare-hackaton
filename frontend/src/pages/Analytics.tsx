import type React from "react"
import { useState, useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import {
  Calendar,
  Activity,
  AlertTriangle,
  BarChart3,
  Target,
  ChevronDown,
  Filter,
  TrendingUp,
  Award,
} from "lucide-react"
import { formatPercentage } from "../lib/formatters"
import { useGetAdherenceHistory } from "../hooks/useAdherence"
import { useTranslation } from "react-i18next"
import { LoadingSpinner } from "../components/LoadingSpinner"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface AdherenceRecord {
  id: string
  user_id: string
  medication_id: string
  scheduled_date: string
  scheduled_time: string
  status: "taken" | "skipped" | "pending"
  taken_at?: string
  notes?: string
  medication: {
    id: string
    name: string
    dosage: string
    instructions: string
  }
}

interface OverallStats {
  total: number
  taken: number
  skipped: number
  adherenceRate: number
}

interface DayOfWeekStat {
  day: string
  total: number
  taken: number
  rate: number
}

interface MedicationStat {
  id: string
  name: string
  total: number
  taken: number
  skipped: number
  adherenceRate: number
  riskScore: number
}

interface WeeklyTrend {
  week: string
  startDate: string
  endDate: string
  total: number
  taken: number
  skipped: number
  adherenceRate: number
}

interface AnalyticsStats {
  overall: OverallStats
  dayOfWeekStats: DayOfWeekStat[]
  medicationStats: MedicationStat[]
  weeklyTrends: WeeklyTrend[]
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const DATE_RANGE_OPTIONS = [
  { value: 7, label: "analytics.page.date_range.last_7_days" },
  { value: 30, label: "analytics.page.date_range.last_30_days" },
  { value: 90, label: "analytics.page.date_range.last_90_days" },
]

export const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const [dateRangeDays, setDateRangeDays] = useState(30)

  const { data: adherenceData, isLoading, error } = useGetAdherenceHistory()

  const filteredData = useMemo(() => {
    if (!adherenceData) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays)

    return adherenceData.filter((record: AdherenceRecord) => {
      const recordDate = new Date(record.scheduled_date + "T00:00:00")
      return recordDate >= cutoffDate
    })
  }, [adherenceData, dateRangeDays])

  const stats = useMemo((): AnalyticsStats | null => {
    if (!filteredData.length) return null

    // Calculate overall stats
    const total = filteredData.length
    const taken = filteredData.filter((record) => record.status === "taken").length
    const skipped = filteredData.filter((record) => record.status === "skipped").length

    // Adherence rate should exclude pending doses
    const completedDoses = taken + skipped
    const adherenceRate = completedDoses > 0 ? (taken / completedDoses) * 100 : 0

    // Calculate day of week stats
    const dayOfWeekStats: DayOfWeekStat[] = DAYS_OF_WEEK.map((day, index) => {
      const dayRecords = filteredData.filter((record) => {
        const recordDate = new Date(record.scheduled_date + "T00:00:00")
        return recordDate.getDay() === index
      })

      const dayTotal = dayRecords.length
      const dayTaken = dayRecords.filter((record) => record.status === "taken").length
      const daySkipped = dayRecords.filter((record) => record.status === "skipped").length
      const dayCompleted = dayTaken + daySkipped
      const dayRate = dayCompleted > 0 ? (dayTaken / dayCompleted) * 100 : 0

      return {
        day,
        total: dayTotal,
        taken: dayTaken,
        rate: dayRate,
      }
    })

    // Calculate medication-specific stats
    const medicationMap = new Map<string, MedicationStat>()

    filteredData.forEach((record) => {
      const medId = record.medication.id
      if (!medicationMap.has(medId)) {
        medicationMap.set(medId, {
          id: medId,
          name: record.medication.name,
          total: 0,
          taken: 0,
          skipped: 0,
          adherenceRate: 0,
          riskScore: 0,
        })
      }

      const medStat = medicationMap.get(medId)!
      medStat.total++

      if (record.status === "taken") {
        medStat.taken++
      } else if (record.status === "skipped") {
        medStat.skipped++
      }
    })

    // Calculate adherence rates and risk scores for medications
    const medicationStats = Array.from(medicationMap.values()).map((medStat) => {
      const completed = medStat.taken + medStat.skipped
      medStat.adherenceRate = completed > 0 ? (medStat.taken / completed) * 100 : 0
      medStat.riskScore = medStat.total > 0 ? Math.round((medStat.skipped / medStat.total) * 100) : 0
      return medStat
    })

    // Calculate weekly trends
    const weeklyTrends: WeeklyTrend[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dateRangeDays)

    const currentDate = new Date(startDate)
    let weekIndex = 1

    while (currentDate <= new Date()) {
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekRecords = filteredData.filter((record) => {
        const recordDate = new Date(record.scheduled_date + "T00:00:00")
        return recordDate >= currentDate && recordDate <= weekEnd
      })

      const weekTotal = weekRecords.length
      const weekTaken = weekRecords.filter((record) => record.status === "taken").length
      const weekSkipped = weekRecords.filter((record) => record.status === "skipped").length
      const weekCompleted = weekTaken + weekSkipped
      const weekRate = weekCompleted > 0 ? (weekTaken / weekCompleted) * 100 : 0

      weeklyTrends.push({
        week: `Week ${weekIndex}`,
        startDate: currentDate.toISOString().split("T")[0],
        endDate: weekEnd.toISOString().split("T")[0],
        total: weekTotal,
        taken: weekTaken,
        skipped: weekSkipped,
        adherenceRate: weekRate,
      })

      currentDate.setDate(currentDate.getDate() + 7)
      weekIndex++
    }

    return {
      overall: {
        total,
        taken,
        skipped,
        adherenceRate,
      },
      dayOfWeekStats,
      medicationStats,
      weeklyTrends,
    }
  }, [filteredData])

  // Chart configurations
  const weeklyTrendsData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] }

    return {
      labels: stats.weeklyTrends.map((trend) => trend.week),
      datasets: [
        {
          label: "Adherence Rate (%)",
          data: stats.weeklyTrends.map((trend) => trend.adherenceRate),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#8b5cf6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }
  }, [stats])

  const dayOfWeekData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] }

    return {
      labels: stats.dayOfWeekStats.map((stat) => stat.day.slice(0, 3)),
      datasets: [
        {
          label: "Adherence Rate (%)",
          data: stats.dayOfWeekStats.map((stat) => stat.rate),
          backgroundColor: stats.dayOfWeekStats.map((stat) => {
            if (stat.rate >= 90) return "#10b981"
            if (stat.rate >= 70) return "#f59e0b"
            return "#ef4444"
          }),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [stats])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            color: "#6b7280",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#6b7280",
          },
        },
      },
    }),
    [],
  )

  const getAdherenceGrade = (rate: number) => {
    if (rate >= 95)
      return {
        grade: "A+",
        color: "from-emerald-500 to-green-600",
        text: t("analytics.page.overview.grade.excellent"),
        emoji: "🌟",
      }
    if (rate >= 90)
      return {
        grade: "A",
        color: "from-green-500 to-emerald-600",
        text: t("analytics.page.overview.grade.great"),
        emoji: "🎯",
      }
    if (rate >= 80)
      return {
        grade: "B",
        color: "from-blue-500 to-indigo-600",
        text: t("analytics.page.overview.grade.good"),
        emoji: "⭐",
      }
    if (rate >= 70)
      return {
        grade: "C",
        color: "from-yellow-500 to-orange-600",
        text: t("analytics.page.overview.grade.fair"),
        emoji: "💫",
      }
    return {
      grade: "D",
      color: "from-red-500 to-rose-600",
      text: t("analytics.page.overview.grade.needs_improvement"),
      emoji: "🌱",
    }
  }

  const getMotivationalMessage = (rate: number) => {
    if (rate >= 95) return "🌟 Absolutely incredible! You're a true health champion!"
    if (rate >= 90) return "💪 Outstanding work! Your dedication is inspiring!"
    if (rate >= 80) return "👍 Great job! You're building excellent habits!"
    if (rate >= 70) return "🌱 Good progress! Keep up the momentum!"
    return "💙 Every step counts! You're on your health journey!"
  }

  if (isLoading) return null
  if (error) return null
  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t("analytics.page.empty.title")}</h2>
          <p className="text-gray-600 mb-6 text-sm">{t("analytics.page.empty.message")}</p>
        </div>
      </div>
    )
  }

  const adherenceGrade = getAdherenceGrade(stats.overall.adherenceRate)
  const safeStats = stats as AnalyticsStats

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center py-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Health Analytics 📊</h1>
            <p className="text-gray-600">Insights into your medication adherence journey</p>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl text-white overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">{t("analytics.page.title")}</h2>
                      <p className="text-blue-100">{t("analytics.page.subtitle")}</p>
                    </div>
                  </div>

                  {/* Overall Grade */}
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${adherenceGrade.color} flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-white font-bold text-xl">{adherenceGrade.grade}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-bold text-white text-lg">{adherenceGrade.text}</p>
                          <span className="text-2xl">{adherenceGrade.emoji}</span>
                        </div>
                        <p className="text-blue-100">
                          {formatPercentage(safeStats.overall.adherenceRate)} {t("analytics.page.overview.adherence_rate")}
                        </p>
                        <p className="text-blue-100 text-sm mt-1">
                          {getMotivationalMessage(safeStats.overall.adherenceRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Range Selector */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-white" />
                    <select
                      className="bg-white text-blue-600 border-none focus:ring-0 font-bold pr-8 appearance-none cursor-pointer rounded-lg px-3 py-2"
                      value={dateRangeDays}
                      onChange={(e) => setDateRangeDays(Number(e.target.value))}
                    >
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: t("analytics.page.overview.total_doses"),
                value: safeStats.overall.total,
                icon: Calendar,
                color: "from-blue-500 to-indigo-600",
                bgColor: "from-blue-50 to-indigo-50",
                emoji: "📅",
              },
              {
                title: t("analytics.page.overview.doses_taken"),
                value: safeStats.overall.taken,
                icon: Activity,
                color: "from-emerald-500 to-green-600",
                bgColor: "from-emerald-50 to-green-50",
                emoji: "✅",
              },
              {
                title: t("analytics.page.overview.doses_skipped"),
                value: safeStats.overall.skipped,
                icon: AlertTriangle,
                color: "from-red-500 to-rose-600",
                bgColor: "from-red-50 to-rose-50",
                emoji: "⏸️",
              },
              {
                title: t("analytics.page.overview.adherence_rate"),
                value: formatPercentage(safeStats.overall.adherenceRate),
                icon: Target,
                color: "from-purple-500 to-indigo-600",
                bgColor: "from-purple-50 to-indigo-50",
                emoji: "🎯",
              },
            ].map((stat) => (
              <div
                key={stat.title}
                className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100/50 p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <h3 className="text-sm font-bold text-gray-600">{stat.title}</h3>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trends Chart */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">{t("analytics.page.charts.weekly_trends.title")}</h3>
                    <p className="text-purple-100 text-sm">{t("analytics.page.charts.weekly_trends.subtitle")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <Line data={weeklyTrendsData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Day of Week Chart */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl border border-green-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">{t("analytics.page.charts.day_of_week.title")}</h3>
                    <p className="text-emerald-100 text-sm">{t("analytics.page.charts.day_of_week.subtitle")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <Bar data={dayOfWeekData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Medication Performance Table */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-xl border border-orange-100/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">{t("analytics.page.medications.title")}</h3>
                  <p className="text-amber-100 text-sm">{t("analytics.page.medications.subtitle")}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b-2 border-orange-200">
                      <th className="pb-3 font-bold text-gray-700">
                        {t("analytics.page.medications.table.medication")}
                      </th>
                      <th className="pb-3 font-bold text-gray-700">
                        {t("analytics.page.medications.table.adherence")}
                      </th>
                      <th className="pb-3 font-bold text-gray-700">
                        {t("analytics.page.medications.table.risk_score")}
                      </th>
                      <th className="pb-3 font-bold text-gray-700">
                        {t("analytics.page.medications.table.total_doses")}
                      </th>
                      <th className="pb-3 font-bold text-gray-700">{t("analytics.page.medications.table.taken")}</th>
                      <th className="pb-3 font-bold text-gray-700">{t("analytics.page.medications.table.skipped")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {safeStats.medicationStats.map((med, index) => (
                      <tr
                        key={med.id}
                        className="hover:bg-orange-50 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="py-4 font-bold text-gray-900">{med.name}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold ${
                              med.adherenceRate >= 90
                                ? "bg-green-100 text-green-800"
                                : med.adherenceRate >= 70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formatPercentage(med.adherenceRate)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold ${
                              med.riskScore <= 10
                                ? "bg-green-100 text-green-800"
                                : med.riskScore <= 30
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {med.riskScore}%
                          </span>
                        </td>
                        <td className="py-4 font-medium text-gray-700">{med.total}</td>
                        <td className="py-4 font-medium text-green-600">{med.taken}</td>
                        <td className="py-4 font-medium text-red-600">{med.skipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-3xl shadow-xl p-6 text-center">
            <div className="text-3xl mb-3">{adherenceGrade.emoji}</div>
            <h3 className="text-xl font-bold mb-2">
              {safeStats.overall.adherenceRate >= 80
                ? "Your analytics look amazing!"
                : "Great insights into your health journey!"}
            </h3>
            <p className="text-pink-100">
              {safeStats.overall.adherenceRate >= 80
                ? "Your consistent medication adherence is creating positive health outcomes. Keep up this fantastic work!"
                : "Understanding your patterns is the first step to improvement. Every insight helps you build better habits!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
