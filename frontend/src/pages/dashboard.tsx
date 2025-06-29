import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTodaySchedule, useDashboardStats, useDashboardActions } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { DateTime } from 'luxon';
import { useRealtimeMedications, useRealtimeAdherence, useRealtimeReminders } from '@/hooks/useRealtime';

export function DashboardPage() {
  const { user } = useAuth();

  // Enable realtime updates for dashboard data
  useRealtimeMedications();
  useRealtimeAdherence();
  useRealtimeReminders();

  // Fetch real data using custom hooks
  const { data: todaySchedule, isLoading: scheduleLoading } = useTodaySchedule();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { handleMedicationAction, isLoading: actionLoading } = useDashboardActions();

  // Hora local del usuario
  const userTimezone = user?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nowLocal = DateTime.now().setZone(userTimezone);
  const localTimeStr = nowLocal.toFormat('HH:mm');
  const localTzStr = nowLocal.offsetNameShort;

  const isLoading = scheduleLoading || statsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats || !todaySchedule) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trial Banner */}

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">
            Here's your medication overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold">{localTimeStr} <span className="text-xs text-muted-foreground">{localTzStr}</span></span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {(stats.today.adherenceRate).toFixed() || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Today's Adherence</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.completed}/{stats.today.total}</div>
            <Progress value={stats.today.adherenceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.today.pending} doses remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.week.adherenceRate).toFixed()}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.week.taken} of {stats.week.total} doses taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMedications}</div>
            <p className="text-xs text-muted-foreground">
              Currently prescribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>{' '}
            <Activity className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${stats.ranking.color}`}>{stats.ranking.grade}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ranking.text}
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
            {todaySchedule.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {item.medication ? item.medication.name : <span className="italic text-muted-foreground">Unknown</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.medication && item.medication.dosage ? (
                        <>
                          {item.medication.dosage.amount}
                          {item.medication.dosage.unit}
                        </>
                      ) : (
                        <span className="italic">No dosage</span>
                      )}
                      {" at "}
                      <span className="font-semibold">
                        {item.scheduled_local_time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.adherenceId ? (
                    item.status === 'taken' ? (
                      <Badge variant="default" className="bg-success-light border">
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
                          onClick={() => handleMedicationAction(item.adherenceId!, 'take')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={actionLoading}
                        >
                          Take
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMedicationAction(item.adherenceId!, 'skip')}
                          disabled={actionLoading}
                        >
                          Skip
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge variant="secondary">No adherence</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats & Alerts */}
        {/* <Card>
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
            {alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${alert.priority === 'warning' ? 'bg-warning-light' :
                    alert.priority === 'info' ? 'bg-info-light' :
                      alert.priority === 'success' ? 'bg-success-light' :
                        'bg-muted'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    {alert.type === 'refill' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'upcoming' && <Clock className="h-4 w-4" />}
                    {alert.type === 'achievement' && <CheckCircle2 className="h-4 w-4" />}
                    {alert.type === 'missed' && <XCircle className="h-4 w-4" />}
                    <span className="font-medium">
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">
                    {alert.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-muted border text-center">
                <p className="text-sm text-muted-foreground">
                  No alerts at this time
                </p>
              </div>
            )}

            <Button className="w-full mt-4" variant="outline">
              View All Notifications
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}