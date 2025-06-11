import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  TrendingDown,
  Target,
  Award,
  Calendar,
  Clock,
  Pill,
  Activity,
  Star,
  Trophy,
  Medal,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { PremiumGuard } from '@/components/premium/premium-guard';
import { useAnalyticsOverview, useAnalyticsInsights } from '@/hooks/useAnalyticsData';
import { useActiveMedications } from '@/hooks/useMedications';

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

  // Combine insights with analytics data
  const combinedAnalyticsData = analyticsData ? {
    ...analyticsData,
    insights: insights || [],
  } : null;

  const getRankingColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-purple-600 bg-purple-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRankingIcon = (rank: string) => {
    switch (rank) {
      case 'S': return <Crown className="h-6 w-6" />;
      case 'A': return <Trophy className="h-6 w-6" />;
      case 'B': return <Medal className="h-6 w-6" />;
      case 'C': return <Award className="h-6 w-6" />;
      case 'D': return <Star className="h-6 w-6" />;
      case 'E': return <Target className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
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
          callback: function(value: any) {
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!combinedAnalyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
          <p className="text-muted-foreground">
            Start taking your medications to see analytics and insights.
          </p>
        </div>
      </div>
    );
  }

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
              {medications?.map(med => (
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
            <div className={`text-4xl font-bold ${getRankingColor(combinedAnalyticsData.performanceRanking)} w-16 h-16 rounded-full flex items-center justify-center mb-2`}>
              {combinedAnalyticsData.performanceRanking}
            </div>
            <p className="text-xs text-muted-foreground">
              {combinedAnalyticsData.performanceRanking === 'S' ? 'Perfect' :
               combinedAnalyticsData.performanceRanking === 'A' ? 'Excellent' :
               combinedAnalyticsData.performanceRanking === 'B' ? 'Good' :
               combinedAnalyticsData.performanceRanking === 'C' ? 'Fair' :
               combinedAnalyticsData.performanceRanking === 'D' ? 'Needs Improvement' :
               'Poor'} adherence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <Trophy className="h-4 w-4 text-muted-foreground" />
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
                      labels: combinedAnalyticsData.weeklyAdherence.map(w => w.week),
                      datasets: [{
                        label: 'Weekly Adherence %',
                        data: combinedAnalyticsData.weeklyAdherence.map(w => w.adherence),
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
                    <span className="text-2xl font-bold text-blue-600">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Best Day</span>
                    <span className="text-2xl font-bold text-green-600">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consistency Score</span>
                    <span className="text-2xl font-bold text-purple-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <PremiumGuard feature="advancedAnalytics">
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
                      labels: ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'],
                      datasets: [{
                        data: [95, 88, 75, 82],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
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
                            label: function(context) {
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
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [{
                        label: 'Adherence %',
                        data: [92, 89, 91, 88, 85, 78, 82],
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
                    labels: combinedAnalyticsData.monthlyAdherence.map(d => format(new Date(d.date), 'MMM d')),
                    datasets: [
                      {
                        label: 'Daily Adherence %',
                        data: combinedAnalyticsData.monthlyAdherence.map(d => d.percentage),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                      },
                      {
                        label: '7-Day Moving Average',
                        data: combinedAnalyticsData.monthlyAdherence.map((d, i) => {
                          const start = Math.max(0, i - 3);
                          const end = Math.min(combinedAnalyticsData.monthlyAdherence.length, i + 4);
                          const slice = combinedAnalyticsData.monthlyAdherence.slice(start, end);
                          return slice.reduce((sum, item) => sum + item.percentage, 0) / slice.length;
                        }),
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
          </PremiumGuard>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          {/* Medication-Specific Progress */}
          <div className="grid gap-4">
            {combinedAnalyticsData.medicationBreakdown.map((med, index) => (
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
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{med.takenDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Taken</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{med.totalDoses - med.takenDoses}</div>
                        <div className="text-xs text-muted-foreground">Doses Missed</div>
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
          <PremiumGuard feature="riskPredictions">
            {/* AI-Generated Insights */}
            <div className="grid gap-4">
            {combinedAnalyticsData.insights.map((insight, index) => (
              <Card key={index} className={
                insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
                insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
                'border-blue-200 bg-blue-50 dark:bg-blue-950'
              }>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${
                    insight.type === 'positive' ? 'text-green-800 dark:text-green-200' :
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
          <Card>
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
          </Card>

          {/* Goals and Achievements */}
          <Card>
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
          </Card>
          </PremiumGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}