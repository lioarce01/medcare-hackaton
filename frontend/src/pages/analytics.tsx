import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Clock,
  Pill,
  Activity,
  Star,
  Trophy,
  Medal,
  AlertTriangle,
} from 'lucide-react';
import { useAnalyticsOverview, useAnalyticsInsights, TimelineDataType } from '@/hooks/useAnalyticsData';
import { useActiveMedications } from '@/hooks/useMedications';
import { DateTime } from 'luxon';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMedication, setSelectedMedication] = useState<string>('all');

  // Use real data hooks
  const { data: analyticsData, isLoading } = useAnalyticsOverview(timeRange);
  const { data: insights } = useAnalyticsInsights();
  const { data: medications } = useActiveMedications();

  // Combine all analytics data
  const combinedAnalyticsData = useMemo(() => {
    if (!analyticsData || !insights || !medications) {
      return null;
    }

    return {
      ...analyticsData,
      insights,
      medications
    };
  }, [analyticsData, insights, medications]);

  // Use backend-provided ranking color and text if available
  const getRankingColor = (rank: string) => {
    if (analyticsData?.rankingColor) {
      return `text-${analyticsData.rankingColor} bg-${analyticsData.rankingColor.replace('600', '100')}`;
    }
    switch (rank) {
      case 'S': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'A': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'B': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'C': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'D': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'E': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getRankingText = (rank: string) => {
    if (analyticsData?.rankingText) {
      return analyticsData.rankingText;
    }
    switch (rank) {
      case 'S': return 'Perfect';
      case 'A': return 'Excellent';
      case 'B': return 'Good';
      case 'C': return 'Fair';
      case 'D': return 'Needs Improvement';
      default: return 'Poor';
    }
  };

  const getRankingIcon = (rank: string) => {
    switch (rank) {
      case 'A': return <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'B': return <Medal className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
      case 'C': return <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      case 'D': return <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'E': return <Target className="h-6 w-6 text-gray-600 dark:text-gray-300" />;
      default: return <Activity className="h-6 w-6 text-gray-600 dark:text-gray-300" />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  // Get user timezone at the top before any usage
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!combinedAnalyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
          <p className="text-muted-foreground">
            Start taking your medications to see analytics and insights.
          </p>
        </div>
      </div>
    );
  }

  // --- Summary statistics from real data ---
  const monthlyAdherenceWithMeds = combinedAnalyticsData?.monthlyAdherence?.filter((d: any) => d.total > 0) || [];
  const monthlyPercentages = monthlyAdherenceWithMeds.map((d: any) => d.percentage);
  const averageAdherence = monthlyPercentages.length > 0 ? Math.round(monthlyPercentages.reduce((a: number, b: number) => a + b, 0) / monthlyPercentages.length) : 0;
  const bestDay = monthlyPercentages.length > 0 ? Math.max(...monthlyPercentages) : 0;
  const consistencyScore = monthlyPercentages.length > 0 ? Math.round(monthlyPercentages.filter((p: number) => p >= 80).length / monthlyPercentages.length * 100) : 0;

  // --- Time of day analysis ---
  const timeOfDayBuckets = [0, 6, 12, 18, 24];
  const timeOfDayLabels = ['Night (0-6)', 'Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'];
  const timeOfDayData = [0, 0, 0, 0];
  const timeOfDayCounts = [0, 0, 0, 0];
  if (combinedAnalyticsData?.monthlyAdherence) {
    // Only count days with at least one medication (total > 0)
    for (const d of combinedAnalyticsData.monthlyAdherence) {
      if (d.total > 0) {
        const hour = DateTime.fromISO(d.date, { zone: 'utc' }).setZone(timezone).hour;
        for (let i = 0; i < timeOfDayBuckets.length - 1; i++) {
          if (hour >= timeOfDayBuckets[i] && hour < timeOfDayBuckets[i + 1]) {
            timeOfDayData[i] += d.percentage;
            timeOfDayCounts[i]++;
            break;
          }
        }
      }
    }
  }
  const timeOfDayAverages = timeOfDayData.map((sum, i) => timeOfDayCounts[i] > 0 ? Math.round(sum / timeOfDayCounts[i]) : 0);

  // --- Day of week analysis ---
  const dayOfWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayOfWeekData = [0, 0, 0, 0, 0, 0, 0];
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  if (combinedAnalyticsData?.monthlyAdherence) {
    // Only count days with at least one medication (total > 0)
    for (const d of combinedAnalyticsData.monthlyAdherence) {
      if (d.total > 0) {
        const weekday = DateTime.fromISO(d.date, { zone: 'utc' }).setZone(timezone).weekday % 7; // 0=Sun, 1=Mon, ...
        dayOfWeekData[weekday] += d.percentage;
        dayOfWeekCounts[weekday]++;
      }
    }
  }
  const dayOfWeekAverages = dayOfWeekData.map((sum, i) => dayOfWeekCounts[i] > 0 ? Math.round(sum / dayOfWeekCounts[i]) : 0);

  // --- 30-Day Trend Analysis Data Preparation ---
  // Always include today as the last day in the range
  const days = 30;
  const today = DateTime.now().setZone(timezone).startOf('day');
  const start = today.minus({ days: days - 1 });
  const allDays: string[] = [];
  for (let i = 0; i < days; i++) {
    allDays.push(start.plus({ days: i }).toISODate()!);
  }
  // Map adherence data by date for quick lookup
  const adherenceByDate: Record<string, TimelineDataType> = {};
  for (const d of combinedAnalyticsData?.monthlyAdherence || []) {
    adherenceByDate[d.date] = d;
  }
  // Build chart data for all days in range
  const trendLabels = allDays.map(dateStr =>
    DateTime.fromISO(dateStr, { zone: 'utc' }).setZone(timezone).toFormat('MMM d')
  );
  const trendPercentages = allDays.map(dateStr =>
    adherenceByDate[dateStr]?.total > 0 ? adherenceByDate[dateStr].percentage : 0
  );
  // 7-day moving average, only for days in range
  const trendMovingAvg = trendPercentages.map((_, i, arr) => {
    const start = Math.max(0, i - 3);
    const end = Math.min(arr.length, i + 4);
    const slice = arr.slice(start, end);
    return slice.length > 0 ? Math.round(slice.reduce((sum, v) => sum + v, 0) / slice.length) : 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your medication adherence patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMedication} onValueChange={setSelectedMedication}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Medications</SelectItem>
              {medications?.data.map(med => (
                <SelectItem key={med.id} value={med.id}>{med.name}</SelectItem>
              )) || []}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rank</CardTitle>
            {getRankingIcon(combinedAnalyticsData.performanceRanking)}
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className={`text-4xl font-bold text-black dark:text-black ${getRankingColor(combinedAnalyticsData.performanceRanking)} w-16 h-16 rounded-full flex items-center justify-center mb-2`}>
                {combinedAnalyticsData.performanceRanking}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {getRankingText(combinedAnalyticsData.performanceRanking)} adherence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{combinedAnalyticsData.streakData.current}</div>
            <p className="text-xs text-muted-foreground">
              days of perfect adherence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Trophy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{combinedAnalyticsData.streakData.longest}</div>
            <p className="text-xs text-muted-foreground">
              personal best record
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{combinedAnalyticsData.streakData.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              days with perfect adherence
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="medications">By Medication</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Adherence Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Adherence
                </CardTitle>
                <CardDescription>
                  Your medication adherence percentage by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={combinedAnalyticsData.dailyAdherence} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Trends
                </CardTitle>
                <CardDescription>
                  Adherence trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line
                    data={{
                      labels: combinedAnalyticsData.weeklyAdherence.map((w: any) => w.week),
                      datasets: [{
                        label: 'Weekly Adherence %',
                        data: combinedAnalyticsData.weeklyAdherence.map((w: any) => w.adherence),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                      }]
                    }}
                    options={lineChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>
                Key metrics for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Adherence</span>
                    <span className="text-2xl font-bold text-blue-600">{averageAdherence}%</span>
                  </div>
                  <Progress value={averageAdherence} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Best Day</span>
                    <span className="text-2xl font-bold text-green-600">{bestDay}%</span>
                  </div>
                  <Progress value={bestDay} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consistency Score</span>
                    <span className="text-2xl font-bold text-purple-600">{consistencyScore}%</span>
                  </div>
                  <Progress value={consistencyScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Time-based Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time of Day Analysis</CardTitle>
                <CardDescription>
                  Adherence rates by time of day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut
                    data={{
                      labels: timeOfDayLabels,
                      datasets: [{
                        data: timeOfDayAverages,
                        backgroundColor: [
                          'rgba(139, 92, 246, 0.8)', // Night
                          'rgba(34, 197, 94, 0.8)',  // Morning
                          'rgba(59, 130, 246, 0.8)', // Afternoon
                          'rgba(249, 115, 22, 0.8)', // Evening
                        ],
                        borderWidth: 2,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return context.label + ': ' + context.parsed + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Day of Week Patterns</CardTitle>
                <CardDescription>
                  How your adherence varies by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: dayOfWeekLabels,
                      datasets: [{
                        label: 'Adherence %',
                        data: dayOfWeekAverages,
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(234, 179, 8, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(234, 179, 8, 0.8)',
                        ],
                        borderRadius: 4,
                      }]
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Trend Analysis</CardTitle>
              <CardDescription>
                Detailed view of your adherence patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Line
                  data={{
                    labels: trendLabels,
                    datasets: [
                      {
                        label: 'Daily Adherence %',
                        data: trendPercentages,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                      },
                      {
                        label: '7-Day Moving Average',
                        data: trendMovingAvg,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0.4,
                      }
                    ]
                  }}
                  options={lineChartOptions}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          {/* Medication-Specific Progress */}
          <div className="grid gap-4">
            {combinedAnalyticsData.medicationBreakdown.map((med: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        {med.medication.name}
                      </CardTitle>
                      <CardDescription>
                        {med.medication.dosage.amount}{med.medication.dosage.unit} {med.medication.dosage.form}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={med.adherenceRate >= 90 ? 'default' : med.adherenceRate >= 70 ? 'secondary' : 'destructive'}
                      className={
                        med.adherenceRate >= 90
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : med.adherenceRate >= 70
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                      }
                    >
                      {med.adherenceRate}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Adherence Rate</span>
                        <span>{med.takenDoses}/{med.totalDoses} doses</span>
                      </div>
                      <Progress value={med.adherenceRate} className="h-2" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-5">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{med.takenDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Taken</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{med.missedDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Missed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{med.pendingDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{med.skippedDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{med.adherenceRate}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI-Generated Insights */}
          <div className="grid gap-4">
            {combinedAnalyticsData.insights.map((insight, index) => (
              <Card key={index} className={
                insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
                  insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
                    'border-blue-200 bg-blue-50 dark:bg-blue-950'
              }>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${insight.type === 'positive' ? 'text-green-800 dark:text-green-200' :
                    insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>
                    {typeof insight.icon === 'string' ? (
                      insight.icon === 'Clock' ? <Clock className="h-4 w-4" /> :
                        insight.icon === 'TrendingUp' ? <TrendingUp className="h-4 w-4" /> :
                          insight.icon === 'Calendar' ? <Calendar className="h-4 w-4" /> :
                            insight.icon === 'AlertTriangle' ? <AlertTriangle className="h-4 w-4" /> :
                              <Activity className="h-4 w-4" />
                    ) : insight.icon}
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={
                    insight.type === 'positive' ? 'text-green-700 dark:text-green-300' :
                      insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-blue-700 dark:text-blue-300'
                  }>
                    {insight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Based on your adherence patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Set Evening Reminders</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your evening adherence is 15% lower. Consider setting additional reminders for 6 PM doses.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Maintain Morning Routine</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your morning adherence is excellent at 95%. Keep up the great work!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Weekend Planning</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Weekend adherence drops by 10%. Plan ahead with pill organizers for better consistency.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Goals and Achievements */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Goals & Achievements
              </CardTitle>
              <CardDescription>
                Track your progress towards adherence goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">30-Day Streak Goal</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">12/30 days</div>
                    <Progress value={40} className="w-24 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Medal className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">90% Monthly Adherence</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">87/90%</div>
                    <Progress value={97} className="w-24 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Perfect Week Challenge</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">5/7 days</div>
                    <Progress value={71} className="w-24 h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}