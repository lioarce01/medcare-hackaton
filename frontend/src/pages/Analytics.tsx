import type React from "react"
import { useState, useEffect } from "react"
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
import { supabase } from "../config/supabase"
import { useUser } from "../hooks/useUser"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export const Analytics: React.FC = () => {
  const { data: user } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  })
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    console.log('Analytics useEffect', { user });
    const fetchStats = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch adherence records for the date range
        const { data: adherenceData, error: adherenceError } = await supabase
          .from("adherence")
          .select(`
            *,
            medication:medications (
              id,
              name,
              medication_type
            )
          `)
          .eq("user_id", user.id)
          .gte("scheduled_date", dateRange.startDate.toISOString().split("T")[0])
          .lte("scheduled_date", dateRange.endDate.toISOString().split("T")[0])

        if (adherenceError) throw adherenceError

        // Calculate overall stats
        const total = adherenceData?.length || 0
        const taken = adherenceData?.filter((record) => record.status === "taken").length || 0
        const missed = adherenceData?.filter((record) => record.status === "missed").length || 0
        const skipped = adherenceData?.filter((record) => record.status === "skipped").length || 0
        const adherenceRate = total > 0 ? (taken / (total - skipped)) * 100 : 0

        // Calculate day of week stats
        const dayOfWeekStats = Array.from({ length: 7 }, (_, i) => {
          const dayRecords =
            adherenceData?.filter((record) => {
              const date = new Date(record.scheduled_date)
              return date.getDay() === i
            }) || []

          const dayTotal = dayRecords.length
          const dayTaken = dayRecords.filter((record) => record.status === "taken").length
          const dayRate = dayTotal > 0 ? (dayTaken / dayTotal) * 100 : 0

          return {
            day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i],
            total: dayTotal,
            taken: dayTaken,
            rate: dayRate,
          }
        })

        // Calculate medication-specific stats
        const medicationStats = Object.values(
          adherenceData?.reduce((acc: any, record) => {
            const medId = record.medication.id
            if (!acc[medId]) {
              acc[medId] = {
                id: medId,
                name: record.medication.name,
                total: 0,
                taken: 0,
                missed: 0,
                skipped: 0,
                adherenceRate: 0,
                riskScore: 0,
              }
            }

            acc[medId].total++
            acc[medId][record.status]++

            // Calculate adherence rate for each medication
            acc[medId].adherenceRate =
              acc[medId].total > 0 ? (acc[medId].taken / (acc[medId].total - acc[medId].skipped)) * 100 : 0

            // Calculate simple risk score based on missed doses
            acc[medId].riskScore = Math.min(100, Math.round((acc[medId].skipped / Math.max(1, acc[medId].total)) * 100))

            return acc
          }, {}) || {},
        )

        // Calculate weekly trends
        const weeklyTrends: {
          week: string
          startDate: string
          endDate: string
          total: number
          taken: number
          missed: number
          adherenceRate: number
        }[] = []
        const currentDate = new Date(dateRange.startDate)
        while (currentDate <= dateRange.endDate) {
          const weekEnd = new Date(currentDate)
          weekEnd.setDate(weekEnd.getDate() + 6)

          const weekRecords =
            adherenceData?.filter((record) => {
              const recordDate = new Date(record.scheduled_date)
              return recordDate >= currentDate && recordDate <= weekEnd
            }) || []

          const weekTotal = weekRecords.length
          const weekTaken = weekRecords.filter((record) => record.status === "taken").length
          const weekMissed = weekRecords.filter((record) => record.status === "missed").length
          const weekRate = weekTotal > 0 ? (weekTaken / weekTotal) * 100 : 0

          weeklyTrends.push({
            week: `Week ${weeklyTrends.length + 1}`,
            startDate: currentDate.toISOString().split("T")[0],
            endDate: weekEnd.toISOString().split("T")[0],
            total: weekTotal,
            taken: weekTaken,
            missed: weekMissed,
            adherenceRate: weekRate,
          })

          currentDate.setDate(currentDate.getDate() + 7)
        }

        setStats({
          overall: {
            total,
            taken,
            missed,
            skipped,
            adherenceRate,
          },
          dayOfWeekStats,
          medicationStats,
          weeklyTrends,
        })
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics data")
        console.error("Analytics error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dateRange, user?.id])

  if (loading) {
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
                <p className="text-red-600">{error}</p>
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

  const weeklyTrendsData = {
    labels: stats.weeklyTrends.map((trend: any) => trend.week),
    datasets: [
      {
        label: "Adherence Rate (%)",
        data: stats.weeklyTrends.map((trend: any) => trend.adherenceRate),
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

  const dayOfWeekData = {
    labels: stats.dayOfWeekStats.map((stat: any) => stat.day.slice(0, 3)),
    datasets: [
      {
        label: "Adherence Rate (%)",
        data: stats.dayOfWeekStats.map((stat: any) => stat.rate),
        backgroundColor: stats.dayOfWeekStats.map((stat: any) => {
          if (stat.rate >= 90) return "#10b981"
          if (stat.rate >= 70) return "#f59e0b"
          return "#ef4444"
        }),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
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
  }

  const getAdherenceGrade = (rate: number) => {
    if (rate >= 95) return { grade: "A+", color: "from-emerald-500 to-green-600", text: "Excellent" }
    if (rate >= 90) return { grade: "A", color: "from-green-500 to-emerald-600", text: "Great" }
    if (rate >= 80) return { grade: "B", color: "from-blue-500 to-indigo-600", text: "Good" }
    if (rate >= 70) return { grade: "C", color: "from-yellow-500 to-orange-600", text: "Fair" }
    return { grade: "D", color: "from-red-500 to-rose-600", text: "Needs Improvement" }
  }

  const adherenceGrade = getAdherenceGrade(stats.overall.adherenceRate)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
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

                {/* Enhanced Date Range Selector */}
                <div className="relative">
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
                    <Filter className="w-5 h-5 text-gray-500 ml-2" />
                    <select
                      className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium pr-8 appearance-none cursor-pointer"
                      value={dateRange.startDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          startDate: new Date(e.target.value),
                        }))
                      }
                    >
                      <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}>
                        Last 7 days
                      </option>
                      <option value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}>
                        Last 30 days
                      </option>
                      <option value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}>
                        Last 90 days
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Overall Stats */}
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
                title: "Doses Missed",
                value: stats.overall.missed,
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
              <div key={stat.title} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
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

          {/* Enhanced Weekly Trends Chart */}
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

          {/* Enhanced Medication Performance */}
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
                  {stats.medicationStats.map((med: any, index: number) => (
                    <div
                      key={med.id}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
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

          {/* Enhanced Day of Week Analysis */}
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
