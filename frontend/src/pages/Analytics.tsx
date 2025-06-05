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
  TrendingUp,
  Activity,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Award,
  ChevronDown,
  Filter,
} from "lucide-react"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { formatPercentage } from "../utils/formatters"
import { useGetAdherenceHistory } from "../hooks/useAdherence"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday", 
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
]

export const Analytics: React.FC = () => {
  const [dateRangeDays, setDateRangeDays] = useState(30)
  
  const { data: adherenceData, isLoading, error } = useGetAdherenceHistory()

  const filteredData = useMemo(() => {
    if (!adherenceData) return []
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays)
    
    return adherenceData.filter((record: AdherenceRecord) => {
      const recordDate = new Date(record.scheduled_date + 'T00:00:00')
      return recordDate >= cutoffDate
    })
  }, [adherenceData, dateRangeDays])

  const stats = useMemo((): AnalyticsStats | null => {
    if (!filteredData.length) return null

    // Calculate overall stats
    const total = filteredData.length
    const taken = filteredData.filter(record => record.status === "taken").length
    const skipped = filteredData.filter(record => record.status === "skipped").length
    const pending = filteredData.filter(record => record.status === "pending").length
    
    // Adherence rate should exclude pending doses
    const completedDoses = taken + skipped
    const adherenceRate = completedDoses > 0 ? (taken / completedDoses) * 100 : 0

    // Calculate day of week stats
    const dayOfWeekStats: DayOfWeekStat[] = DAYS_OF_WEEK.map((day, index) => {
      const dayRecords = filteredData.filter(record => {
        const recordDate = new Date(record.scheduled_date + 'T00:00:00')
        return recordDate.getDay() === index
      })

      const dayTotal = dayRecords.length
      const dayTaken = dayRecords.filter(record => record.status === "taken").length
      const daySkipped = dayRecords.filter(record => record.status === "skipped").length
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
    
    filteredData.forEach(record => {
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
    const medicationStats = Array.from(medicationMap.values()).map(medStat => {
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
      
      const weekRecords = filteredData.filter(record => {
        const recordDate = new Date(record.scheduled_date + 'T00:00:00')
        return recordDate >= currentDate && recordDate <= weekEnd
      })

      const weekTotal = weekRecords.length
      const weekTaken = weekRecords.filter(record => record.status === "taken").length
      const weekSkipped = weekRecords.filter(record => record.status === "skipped").length
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
      labels: stats.weeklyTrends.map(trend => trend.week),
      datasets: [
        {
          label: "Adherence Rate (%)",
          data: stats.weeklyTrends.map(trend => trend.adherenceRate),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#3b82f6",
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
      labels: stats.dayOfWeekStats.map(stat => stat.day.slice(0, 3)),
      datasets: [
        {
          label: "Adherence Rate (%)",
          data: stats.dayOfWeekStats.map(stat => stat.rate),
          backgroundColor: stats.dayOfWeekStats.map(stat => {
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

  const chartOptions = useMemo(() => ({
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
  }), [])

  const getAdherenceGrade = (rate: number) => {
    if (rate >= 95) return { grade: "A+", color: "from-emerald-500 to-green-600", text: "Excellent" }
    if (rate >= 90) return { grade: "A", color: "from-green-500 to-emerald-600", text: "Great" }
    if (rate >= 80) return { grade: "B", color: "from-blue-500 to-indigo-600", text: "Good" }
    if (rate >= 70) return { grade: "C", color: "from-yellow-500 to-orange-600", text: "Fair" }
    return { grade: "D", color: "from-red-500 to-rose-600", text: "Needs Improvement" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-indigo-600 font-medium">Analyzing your medication data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
          <div className="relative bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Analytics Error</h3>
                <p className="text-red-600">{error?.message || "Failed to load analytics data"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    )
  }

  const adherenceGrade = getAdherenceGrade(stats.overall.adherenceRate)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h1>
                      <p className="text-gray-600">Insights into your medication journey</p>
                    </div>
                  </div>

                  {/* Overall Grade */}
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${adherenceGrade.color} flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-white font-bold text-lg">{adherenceGrade.grade}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{adherenceGrade.text}</p>
                        <p className="text-sm text-gray-600">
                          {formatPercentage(stats.overall.adherenceRate)} adherence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Range Selector */}
                <div className="relative">
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
                    <Filter className="w-5 h-5 text-gray-500 ml-2" />
                    <select
                      className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium pr-8 appearance-none cursor-pointer"
                      value={dateRangeDays}
                      onChange={(e) => setDateRangeDays(Number(e.target.value))}
                    >
                      {DATE_RANGE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Total Doses",
                value: stats.overall.total,
                icon: Calendar,
                color: "from-blue-500 to-indigo-600",
                bgColor: "from-blue-50 to-indigo-50",
              },
              {
                title: "Doses Taken",
                value: stats.overall.taken,
                icon: Activity,
                color: "from-emerald-500 to-green-600",
                bgColor: "from-emerald-50 to-green-50",
              },
              {
                title: "Doses Skipped",
                value: stats.overall.skipped,
                icon: AlertTriangle,
                color: "from-red-500 to-rose-600",
                bgColor: "from-red-50 to-rose-50",
              },
              {
                title: "Adherence Rate",
                value: formatPercentage(stats.overall.adherenceRate),
                icon: Target,
                color: "from-purple-500 to-indigo-600",
                bgColor: "from-purple-50 to-indigo-50",
              },
            ].map((stat, index) => (
              <div key={stat.title} className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity`}
                ></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</h3>
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Trends Chart */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-indigo-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Weekly Adherence Trends</h3>
                    <p className="text-gray-600">Track your progress over time</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <Line data={weeklyTrendsData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Medication Performance */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Medication Performance</h3>
                    <p className="text-gray-600">Individual medication adherence rates</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.medicationStats.map((med, index) => (
                    <div
                      key={med.id}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800">{med.name}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium text-emerald-600">{med.taken}</span> taken
                            </span>
                            <span className="text-sm text-gray-600">
                              <span className="font-medium text-red-600">{med.skipped}</span> skipped
                            </span>
                            <span className="text-sm text-gray-600">
                              <span className="font-medium text-gray-700">{med.total}</span> total
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{formatPercentage(med.adherenceRate)}</div>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              med.riskScore < 30
                                ? "bg-emerald-100 text-emerald-800"
                                : med.riskScore < 70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            Risk: {med.riskScore}%
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              med.adherenceRate >= 90
                                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                : med.adherenceRate >= 70
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                  : "bg-gradient-to-r from-red-400 to-rose-500"
                            }`}
                            style={{ width: `${med.adherenceRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Day of Week Analysis */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Day of Week Analysis</h3>
                    <p className="text-gray-600">Identify patterns in your adherence</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <Bar data={dayOfWeekData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}