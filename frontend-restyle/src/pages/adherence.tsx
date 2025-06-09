import { useState, useEffect } from 'react';
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
import { mockMedications, mockAdherence, generateAdherenceData } from '@/lib/mock-data';
import { Medication, Adherence } from '@/types';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [adherenceData, setAdherenceData] = useState<AdherenceDay[]>([]);
  const [filterMedication, setFilterMedication] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading and generate adherence data
    const timer = setTimeout(() => {
      generateAdherenceCalendarData();
      setChartData(generateAdherenceData(30));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const generateAdherenceCalendarData = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const adherenceCalendarData: AdherenceDay[] = days.map(date => {
      const dayMedications = mockMedications.flatMap(med => 
        med.scheduled_times.map(time => {
          // Generate realistic adherence data
          const isToday = isSameDay(date, new Date());
          const isFuture = date > new Date();
          
          let status: 'taken' | 'skipped' | 'missed' | 'pending';
          let taken_time: string | undefined;

          if (isFuture) {
            status = 'pending';
          } else if (isToday) {
            const currentHour = new Date().getHours();
            const scheduledHour = parseInt(time.split(':')[0]);
            
            if (currentHour >= scheduledHour) {
              status = Math.random() > 0.2 ? 'taken' : 'skipped';
              taken_time = status === 'taken' ? 
                `${date.toISOString().split('T')[0]}T${time}:00Z` : undefined;
            } else {
              status = 'pending';
            }
          } else {
            // Past dates - generate realistic adherence (85% taken, 10% skipped, 5% missed)
            const rand = Math.random();
            if (rand < 0.85) {
              status = 'taken';
              taken_time = `${date.toISOString().split('T')[0]}T${time}:00Z`;
            } else if (rand < 0.95) {
              status = 'skipped';
            } else {
              status = 'missed';
            }
          }

          return {
            medication: med,
            status,
            scheduled_time: time,
            taken_time,
          };
        })
      );

      const total = dayMedications.length;
      const taken = dayMedications.filter(m => m.status === 'taken').length;
      const skipped = dayMedications.filter(m => m.status === 'skipped').length;
      const missed = dayMedications.filter(m => m.status === 'missed').length;
      const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        date,
        adherenceData: { total, taken, skipped, missed, percentage },
        medications: dayMedications,
      };
    });

    setAdherenceData(adherenceCalendarData);
  };

  const getSelectedDayData = () => {
    return adherenceData.find(day => isSameDay(day.date, selectedDate));
  };

  const getCalendarDayClassName = (date: Date) => {
    const dayData = adherenceData.find(day => isSameDay(day.date, date));
    if (!dayData || dayData.adherenceData.total === 0) return '';

    const percentage = dayData.adherenceData.percentage;
    if (percentage >= 90) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    return 'bg-red-100 text-red-800 hover:bg-red-200';
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Taken</Badge>;
      case 'skipped':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Skipped</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const calculateMonthlyStats = () => {
    const totalDoses = adherenceData.reduce((sum, day) => sum + day.adherenceData.total, 0);
    const takenDoses = adherenceData.reduce((sum, day) => sum + day.adherenceData.taken, 0);
    const skippedDoses = adherenceData.reduce((sum, day) => sum + day.adherenceData.skipped, 0);
    const missedDoses = adherenceData.reduce((sum, day) => sum + day.adherenceData.missed, 0);
    
    return {
      total: totalDoses,
      taken: takenDoses,
      skipped: skippedDoses,
      missed: missedDoses,
      percentage: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0,
    };
  };

  const selectedDayData = getSelectedDayData();
  const monthlyStats = calculateMonthlyStats();

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
          <Badge variant="outline" className="text-sm">
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
            <div className="text-2xl font-bold">{monthlyStats.percentage}%</div>
            <Progress value={monthlyStats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {monthlyStats.taken} of {monthlyStats.total} doses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Taken</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthlyStats.taken}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats.total > 0 ? Math.round((monthlyStats.taken / monthlyStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Skipped</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthlyStats.skipped}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats.total > 0 ? Math.round((monthlyStats.skipped / monthlyStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Missed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monthlyStats.missed}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyStats.total > 0 ? Math.round((monthlyStats.missed / monthlyStats.total) * 100) : 0}% of total
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
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  className="rounded-md border"
                  modifiers={{
                    adherence: (date) => {
                      const dayData = adherenceData.find(day => isSameDay(day.date, date));
                      return dayData && dayData.adherenceData.total > 0;
                    }
                  }}
                  modifiersClassNames={{
                    adherence: 'font-bold'
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      const dayData = adherenceData.find(day => isSameDay(day.date, date));
                      const className = getCalendarDayClassName(date);
                      
                      return (
                        <div className={`relative ${className} rounded-md`} {...props}>
                          {format(date, 'd')}
                          {dayData && dayData.adherenceData.total > 0 && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className={`w-2 h-2 rounded-full ${
                                dayData.adherenceData.percentage >= 90 ? 'bg-green-600' :
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Medications</SelectItem>
                      {mockMedications.map(med => (
                        <SelectItem key={med.id} value={med.id}>{med.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
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
              {adherenceData
                .slice()
                .reverse()
                .slice(0, 14) // Show last 14 days
                .map((dayData, dayIndex) => {
                  const filteredMeds = filteredMedications(dayData.medications);
                  
                  if (filteredMeds.length === 0) return null;

                  return (
                    <div key={dayIndex} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {format(dayData.date, 'EEEE, MMM d, yyyy')}
                        </h4>
                        <Badge variant="outline">
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
                })}
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