import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pill,
  Filter,
  BarChart3,
  Target,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays, addDays } from 'date-fns';
// Remove mock data import if not used elsewhere
// import { mockMedications, mockAdherence, generateAdherenceData } from '@/lib/mock-data';
import { Medication, Adherence } from '@/types';
// Import useActiveMedications hook
import { useAdherenceCalendar, useAdherenceStats } from '@/hooks/useAdherence';
import { DateTime } from 'luxon';
import { useActiveMedications } from '@/hooks/useMedications';

interface AdherenceDay {
  date: Date;
  adherenceData: {
    total: number;
    taken: number;
    skipped: number;
    missed: number;
    percentage: number;
  };
  medications: Array<{
    medication: Medication;
    status: 'taken' | 'skipped' | 'missed' | 'pending';
    scheduled_time: string;
    taken_time?: string;
  }>;
}

export function AdherencePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [filterMedication, setFilterMedication] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: adherenceStats, isLoading: isStatsLoading } = useAdherenceStats();
  const { data: adherenceData = [], isLoading: isCalendarLoading } = useAdherenceCalendar(selectedMonth);
  // Fetch active medications
  const { data: activeMedications, isLoading: isMedicationsLoading } = useActiveMedications();

  console.log('active meds:', activeMedications)


  // Update isLoading to include medications loading state
  const isLoading = isStatsLoading || isCalendarLoading || isMedicationsLoading;


  function groupAdherenceByDay(adherences: Adherence[], timezone: string): AdherenceDay[] {
    const grouped: Record<string, AdherenceDay> = {};

    for (const item of adherences) {
      // Ensure item.scheduled_datetime is a valid string before processing
      if (!item.scheduled_datetime || typeof item.scheduled_datetime !== 'string') {
        console.warn('Skipping adherence item with invalid scheduled_datetime:', item);
        continue;
      }

      const localDate = DateTime.fromISO(item.scheduled_datetime, { zone: 'utc' }).setZone(timezone).toISODate();
      if (!localDate) {
        console.warn('Skipping adherence item, could not determine local date:', item);
        continue; // skip if localDate is null
      }

      if (!grouped[localDate]) {
        grouped[localDate] = {
          date: DateTime.fromISO(localDate, { zone: timezone }).toJSDate(), // Parse localDate in the target timezone
          adherenceData: { total: 0, taken: 0, skipped: 0, missed: 0, percentage: 0 },
          medications: [],
        };
      }

      // Ensure item.medication exists before pushing
      if (item.medication) {
        grouped[localDate].medications.push({
          medication: item.medication,
          status: item.status,
          scheduled_time: DateTime.fromISO(item.scheduled_datetime, { zone: 'utc' }).setZone(timezone).toFormat('HH:mm'),
          taken_time: item.taken_time || undefined,
        });
      } else {
        console.warn('Skipping adherence item without medication:', item);
      }


      grouped[localDate].adherenceData.total += 1;
      if (item.status === 'taken') grouped[localDate].adherenceData.taken += 1;
      if (item.status === 'skipped') grouped[localDate].adherenceData.skipped += 1;
      if (item.status === 'missed') grouped[localDate].adherenceData.missed += 1;
    }

    // Calcular porcentaje
    for (const day of Object.values(grouped)) {
      const { total, taken } = day.adherenceData;
      day.adherenceData.percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
    }

    // Ordenar por fecha asc
    return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Memoize the result of groupAdherenceByDay
  const groupedData = useMemo(() => {
    console.log('Regrouping adherence data...'); // Add a log to see when this runs
    return groupAdherenceByDay(adherenceData, timezone);
  }, [adherenceData, timezone]); // Dependencies: re-run only when adherenceData or timezone changes


  const selectedDayData = useMemo(() => {
    console.log('Finding selected day data...'); // Add a log
    return groupedData.find(day => isSameDay(day.date, selectedDate));
  }, [groupedData, selectedDate]); // Dependencies: re-run when groupedData or selectedDate changes


  const getCalendarDayClassName = (date: Date) => {
    const dayData = groupedData.find(day => isSameDay(day.date, date));
    if (!dayData || dayData.adherenceData.total === 0) return '';

    const percentage = dayData.adherenceData.percentage;
    if (percentage >= 90) return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:hover:bg-orange-800';
    return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-800 dark:hover:bg-red-800';
  };

  const filteredMedications = (medications: any[]) => {
    return medications.filter(med => {
      const matchesMedication = filterMedication === 'all' || med.medication.id === filterMedication;
      const matchesStatus = filterStatus === 'all' || med.status === filterStatus;
      return matchesMedication && matchesStatus;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'missed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return <Badge className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700">Taken</Badge>;
      case 'skipped':
        return <Badge className="bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:text-white dark:hover:bg-orange-700">Skipped</Badge>;
      case 'missed':
        return <Badge className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700">Missed</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">Pending</Badge>;
    }
  };

  const monthlyStats = adherenceStats?.month;
  const todayStats = adherenceStats?.today;
  const weekStats = adherenceStats?.week;

  // Use the derived isLoading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adherence Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your medication adherence patterns and track your progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-sm bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
            {format(selectedMonth, 'MMMM yyyy')}
          </Badge>
        </div>
      </div>

      {/* Monthly Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Adherence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats ? `${(monthlyStats.adherenceRate).toFixed()}%` : '-'}</div>
            <Progress value={monthlyStats?.adherenceRate ?? 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {monthlyStats?.taken} of {monthlyStats?.total} doses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Taken</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthlyStats?.taken}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats?.total && monthlyStats.total > 0 ? Math.round((monthlyStats.taken / monthlyStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Skipped</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthlyStats?.skipped}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats && monthlyStats.total && monthlyStats.total > 0
                ? Math.round((monthlyStats.skipped / monthlyStats.total) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Missed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monthlyStats?.missed}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats?.total && monthlyStats?.total > 0 ? Math.round(((monthlyStats?.missed ?? 0) / monthlyStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Interactive Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Adherence Calendar
                </CardTitle>
                <CardDescription>
                  Click on any date to view detailed adherence information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-md mx-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    className="rounded-md border-0 w-full"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                      day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md mx-auto flex items-center justify-center",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                    components={{
                      // Destructure displayMonth and any other unwanted props here
                      Day: ({ date, displayMonth, ...props }) => {
                        const dayData = groupedData.find(day => isSameDay(day.date, date));
                        const className = getCalendarDayClassName(date);
                        const isToday = isSameDay(date, new Date());
                        const isSelected = selectedDate && isSameDay(date, selectedDate);

                        return (
                          <div
                            className={`
                              relative h-8 w-8 p-0 font-normal rounded-md mx-auto flex items-center justify-center cursor-pointer
                              ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                              ${isToday && !isSelected ? 'bg-accent text-accent-foreground' : ''}
                              ${className && !isSelected && !isToday ? className : ''}
                              hover:bg-accent hover:text-accent-foreground
                            `}
                            onClick={() => setSelectedDate(date)}
                            {...props} // Spread the remaining props (excluding displayMonth)
                          >
                            <span className="text-sm">{format(date, 'd')}</span>
                            {dayData && dayData.adherenceData.total > 0 && (
                              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
                                <div className={`w-1.5 h-1.5 rounded-full ${dayData.adherenceData.percentage >= 90 ? 'bg-green-600' :
                                  dayData.adherenceData.percentage >= 70 ? 'bg-yellow-600' :
                                    dayData.adherenceData.percentage >= 50 ? 'bg-orange-600' :
                                      'bg-red-600'
                                  }`} />
                              </div>
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Adherence Legend:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span>90%+ (Excellent)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                      <span>70-89% (Good)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                      <span>50-69% (Fair)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span>&lt;50% (Poor)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {format(selectedDate, 'EEEE, MMM d')}
                </CardTitle>
                <CardDescription>
                  Detailed medication schedule for selected day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDayData ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Daily Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedDayData.adherenceData.taken}/{selectedDayData.adherenceData.total}
                        </span>
                      </div>
                      <Progress value={selectedDayData.adherenceData.percentage} />
                      <p className="text-xs text-muted-foreground">
                        {selectedDayData.adherenceData.percentage}% adherence rate
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {selectedDayData.medications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No medications scheduled for this day
                        </p>
                      ) : (
                        selectedDayData.medications.map((med, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(med.status)}
                                <span className="font-medium text-sm">{med.medication.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {med.medication.dosage.amount}{med.medication.dosage.unit} at {med.scheduled_time}
                              </div>
                              {med.taken_time && (
                                <div className="text-xs text-green-600">
                                  Taken at {format(new Date(med.taken_time), 'HH:mm')}
                                </div>
                              )}
                            </div>
                            <div>
                              {getStatusBadge(med.status)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select a date to view adherence details
                  </p>
                )}

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="filter-medication">Filter by Medication</Label>
                  <Select value={filterMedication} onValueChange={setFilterMedication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a medication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Medications</SelectItem>
                      {/* Use activeMedications data here */}
                      {activeMedications?.data.map((med: Medication) => (
                        <SelectItem key={med.id} value={med.id}>{med.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="taken">Taken</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Medication Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of your medication adherence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ensure groupedData is not empty before slicing */}
              {groupedData && groupedData.length > 0 ? (
                groupedData
                  .slice()
                  .slice(0, 14) // Show last 14 days
                  .map((dayData, dayIndex) => {
                    const filteredMeds = filteredMedications(dayData.medications);

                    console.log("filtered meds:", filteredMeds)

                    if (filteredMeds.length === 0) return null;

                    return (
                      <div key={dayIndex} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {format(dayData.date, 'EEEE, MMM d, yyyy')}
                          </h4>
                          <Badge className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700">
                            {dayData.adherenceData.percentage}% adherence
                          </Badge>
                        </div>

                        <div className="grid gap-2">
                          {filteredMeds.map((med, medIndex) => (
                            <div key={medIndex} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Pill className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <div className="font-medium">{med.medication.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {med.medication.dosage.amount}{med.medication.dosage.unit} at {med.scheduled_time}
                                  </div>
                                  {med.taken_time && (
                                    <div className="text-xs text-green-600">
                                      Taken at {format(new Date(med.taken_time), 'HH:mm')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(med.status)}
                                {getStatusBadge(med.status)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {dayIndex < 13 && <Separator />}
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No adherence data available for the selected month.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}