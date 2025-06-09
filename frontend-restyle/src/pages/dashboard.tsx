import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pill,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { mockMedications, mockAdherence, mockAdherenceStats } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';

export function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [todayAdherence, setTodayAdherence] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // Generate today's schedule
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaySchedule = mockMedications.flatMap(med => 
        med.scheduled_times.map(time => ({
          id: `${med.id}-${time}`,
          medication: med,
          scheduled_time: time,
          scheduled_date: today,
          status: Math.random() > 0.3 ? 'taken' : 'pending',
          taken_time: Math.random() > 0.3 ? new Date().toISOString() : null,
        }))
      );
      setTodayAdherence(todaySchedule);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMedicationAction = (id: string, action: 'take' | 'skip') => {
    setTodayAdherence(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              status: action === 'take' ? 'taken' : 'skipped',
              taken_time: action === 'take' ? new Date().toISOString() : null 
            }
          : item
      )
    );
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = mockAdherenceStats;
  const completedToday = todayAdherence.filter(item => item.status === 'taken').length;
  const totalToday = todayAdherence.length;
  const pendingToday = todayAdherence.filter(item => item.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">
            Here's your medication overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {Math.round((completedToday / totalToday) * 100) || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Today's Adherence</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}/{totalToday}</div>
            <Progress value={(completedToday / totalToday) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {pendingToday.length} doses remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Adherence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.week.taken} of {stats.week.total} doses taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedications.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently prescribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rank</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ranking}</div>
            <p className="text-xs text-muted-foreground">
              Excellent adherence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your medication schedule for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAdherence.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{item.medication.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.medication.dosage.amount}{item.medication.dosage.unit} at {item.scheduled_time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'taken' ? (
                    <Badge variant="default\" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Taken
                    </Badge>
                  ) : item.status === 'skipped' ? (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Skipped
                    </Badge>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleMedicationAction(item.id, 'take')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Take
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMedicationAction(item.id, 'skip')}
                      >
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Important Alerts
            </CardTitle>
            <CardDescription>
              Reminders and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Refill Reminder
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Lisinopril refill needed in 3 days
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Upcoming Dose
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Metformin at 8:00 PM
              </p>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Great Progress!
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                7-day streak of perfect adherence
              </p>
            </div>

            <Button className="w-full mt-4" variant="outline">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}