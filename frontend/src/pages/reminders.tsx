import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  Bell,
  Clock,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Settings,
  Phone,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { Medication, Reminder } from '@/types';
import {
  useReminders,
  useCreateReminder,
  useSendReminderManually,
  useDeleteReminder,
  useUpdateReminderSettings,
  useUserSettings
} from '@/hooks/useReminders';
import { useMedications } from '@/hooks/useMedications';
import { useAuth } from '@/hooks/useAuthContext';
import Pagination from '@/components/Pagination';

export function RemindersPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Auth
  const { user } = useAuth();

  // API hooks
  const { data: remindersData, isLoading: remindersLoading, error: remindersError } = useReminders(currentPage, pageSize);
  const reminders = remindersData?.data || [];
  const { data: medicationsData, isLoading: medicationsLoading } = useMedications();
  const { data: userSettings, isLoading: settingsLoading } = useUserSettings();
  const medications: Medication[] = medicationsData?.data || [];
  const createReminderMutation = useCreateReminder();
  const sendReminderMutation = useSendReminderManually();
  const deleteReminderMutation = useDeleteReminder();
  const updateSettingsMutation = useUpdateReminderSettings();

  // Form state for creating reminders
  const [formData, setFormData] = useState({
    medication_id: '',
    scheduled_date: '',
    scheduled_time: '',
    message: '',
    email_enabled: true,
    sms_enabled: false,
  });

  // Safe access to notification preferences with defaults
  const notificationPreferences = {
    email: userSettings?.notification_preferences?.email ?? true,
    sms: userSettings?.notification_preferences?.sms ?? false,
    push: userSettings?.notification_preferences?.push ?? false,
    reminder_before: userSettings?.notification_preferences?.reminder_before ?? 15,
  };

  const handleUpdateNotificationSettings = async (newSettings: Partial<typeof notificationPreferences>) => {
    try {
      await updateSettingsMutation.mutateAsync({
        email_enabled: userSettings?.email_enabled ?? true,
        preferred_times: userSettings?.preferred_times ?? ['08:00', '14:00', '20:00'],
        timezone: userSettings?.timezone ?? 'UTC',
        notification_preferences: {
          ...notificationPreferences,
          ...newSettings
        }
      });
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleCreateReminder = async () => {
    if (!formData.medication_id || !formData.scheduled_date || !formData.scheduled_time || !user) {
      return;
    }

    const selectedMedication = medications.find((med: Medication) => med.id === formData.medication_id);
    if (!selectedMedication) return;

    // Get user timezone
    const userTimezone = userSettings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create datetime in user's timezone first, then convert to UTC
    const localDateTime = DateTime.fromISO(`${formData.scheduled_date}T${formData.scheduled_time}:00`, { zone: userTimezone });
    const utcDateTime = localDateTime.toUTC();

    const reminderData = {
      medication_id: formData.medication_id,
      scheduled_datetime: utcDateTime.toISO(),
      channels: {
        email: {
          enabled: formData.email_enabled,
          sent: false
        },
        sms: {
          enabled: formData.sms_enabled,
          sent: false
        }
      },
      message: formData.message || `Time to take your ${selectedMedication.name}`,
    };

    try {
      await createReminderMutation.mutateAsync({ reminder: reminderData, userId: user.id });
      setFormData({
        medication_id: '',
        scheduled_date: '',
        scheduled_time: '',
        message: '',
        email_enabled: true,
        sms_enabled: false,
      });
      setActiveTab('list');
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await sendReminderMutation.mutateAsync(id);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminderMutation.mutateAsync(id);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const filteredReminders = reminders.filter((reminder: Reminder) => {
    const medication = medications.find((med: Medication) => med.id === reminder.medication_id);
    const matchesSearch = medication?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'default',
      failed: 'destructive',
      pending: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Helper function to format datetime for display
  const formatReminderDateTime = (scheduledDatetime: string) => {
    try {
      const userTimezone = userSettings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      // First, try to parse as UTC (correct format)
      let utcDateTime = DateTime.fromISO(scheduledDatetime, { zone: 'utc' });

      // Check if this datetime was stored incorrectly (as local time instead of UTC)
      // If the time is in the future but shows as past in user timezone, it might be incorrectly stored
      const now = DateTime.now();
      const userDateTime = utcDateTime.setZone(userTimezone);
      const timeDiff = userDateTime.diff(now, 'hours').hours;

      // If the time difference is negative (past) but the reminder is supposed to be in the future,
      // or if the time is more than 12 hours off from what would be expected for a local time,
      // it might be stored incorrectly
      if (timeDiff < -12) {
        // Try parsing as if it was stored in local timezone
        const localDateTime = DateTime.fromISO(scheduledDatetime, { zone: userTimezone });
        if (localDateTime.isValid) {
          utcDateTime = localDateTime.toUTC();
        }
      }

      // Convert to user timezone for display
      const finalUserDateTime = utcDateTime.setZone(userTimezone);

      const result = {
        date: finalUserDateTime.toFormat('MMM d, yyyy'),
        time: finalUserDateTime.toFormat('h:mm a'),
        fullDateTime: finalUserDateTime.toFormat('EEEE, MMMM d, yyyy \'at\' h:mm a'),
        timezone: userTimezone,
        relativeTime: finalUserDateTime.toRelative()
      };

      return result;
    } catch (error) {
      return {
        date: 'Invalid date',
        time: 'Invalid time',
        fullDateTime: 'Invalid datetime',
        timezone: 'UTC',
        relativeTime: 'Invalid time'
      };
    }
  };

  if (remindersLoading || medicationsLoading || settingsLoading) {
    return <LoadingSkeleton />;
  }

  if (remindersError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reminders</h1>
            <p className="text-muted-foreground">
              Manage your medication reminders and notifications
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading reminders</h3>
            <p className="text-muted-foreground text-center mb-4">
              Failed to load reminders. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your medication reminders and notifications
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Reminder
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Reminders List</TabsTrigger>
          <TabsTrigger value="create">Create Reminder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Filter Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by medication or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders List */}
          <div className="space-y-4">
            {filteredReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reminders found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first reminder to get started.'
                    }
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredReminders.map((reminder: Reminder) => {
                const medication = medications.find((med: Medication) => med.id === reminder.medication_id);

                return (
                  <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{medication?.name}</CardTitle>
                            {getStatusBadge(reminder.status)}
                          </div>
                          <CardDescription>
                            {reminder.message}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {reminder.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendReminder(reminder.id)}
                              className="flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Send
                            </Button>
                          )}
                          {reminder.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(reminder.id)}
                              className="flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm">
                            {formatReminderDateTime(reminder.scheduled_datetime).date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatReminderDateTime(reminder.scheduled_datetime).time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm">
                            Email: {reminder.channels.email.enabled ?
                              (reminder.channels.email.sent ? 'Sent' : 'Enabled') :
                              'Disabled'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm">
                            SMS: {reminder.channels.sms.enabled ?
                              (reminder.channels.sms.sent ? 'Sent' : 'Enabled') :
                              'Disabled'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Show relative time and full datetime on hover */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {formatReminderDateTime(reminder.scheduled_datetime).relativeTime}
                          </span>
                          <span>
                            {formatReminderDateTime(reminder.scheduled_datetime).fullDateTime}
                          </span>
                        </div>
                      </div>

                      {reminder.retry_count > 0 && (
                        <div className="mt-4 p-3 bg-warning-light border rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">
                              Retried {reminder.retry_count} time(s)
                              {reminder.last_retry && (
                                <span className="ml-1">
                                  - Last attempt: {formatReminderDateTime(reminder.last_retry).fullDateTime}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {remindersData && remindersData.total > pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination
                page={currentPage}
                limit={pageSize}
                total={remindersData.total}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Reminder
              </CardTitle>
              <CardDescription>
                Set up a new medication reminder with custom scheduling and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Medication Selection */}
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication *</Label>
                  <Select
                    value={formData.medication_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, medication_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((medication: Medication) => (
                        <SelectItem key={medication.id} value={medication.id}>
                          {medication.name} - {medication.dosage.amount}{medication.dosage.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      min={DateTime.now().toFormat('yyyy-MM-dd')}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <div className="relative">
                    <Input
                      id="time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Custom Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter a custom reminder message (optional)"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the default message format
                  </p>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Channels</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send reminders to your email address
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.email_enabled}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, email_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send reminders via text message
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.sms_enabled}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, sms_enabled: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {formData.medication_id && formData.scheduled_date && formData.scheduled_time && (
                <div className="p-4 bg-info-light border rounded-lg">
                  <h4 className="font-medium mb-2">Reminder Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Medication:</strong> {medications.find((m: Medication) => m.id === formData.medication_id)?.name}
                    </p>
                    <p>
                      <strong>Date & Time:</strong> {DateTime.fromISO(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toFormat('EEEE, MMMM d, yyyy \'at\' h:mm a')}
                    </p>
                    <p>
                      <strong>Message:</strong> {formData.message || `Time to take your ${medications.find((m: Medication) => m.id === formData.medication_id)?.name}`}
                    </p>
                    <p>
                      <strong>Channels:</strong> {[
                        formData.email_enabled && 'Email',
                        formData.sms_enabled && 'SMS'
                      ].filter(Boolean).join(', ') || 'None selected'}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateReminder}
                  disabled={!formData.medication_id || !formData.scheduled_date || !formData.scheduled_time || (!formData.email_enabled && !formData.sms_enabled)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Reminder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('list')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure your default notification preferences for medication reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPreferences.email}
                      onCheckedChange={(checked) => handleUpdateNotificationSettings({ email: checked })}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders via text message
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPreferences.sms}
                      onCheckedChange={(checked) => handleUpdateNotificationSettings({ sms: checked })}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPreferences.push}
                      onCheckedChange={(checked) => handleUpdateNotificationSettings({ push: checked })}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Timing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reminder Timing</h3>
                <div className="space-y-2">
                  <Label htmlFor="reminder-before">Remind me before (minutes)</Label>
                  <Select
                    value={notificationPreferences.reminder_before.toString()}
                    onValueChange={(value) => handleUpdateNotificationSettings({ reminder_before: parseInt(value) })}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How early you want to be reminded before your scheduled medication time
                  </p>
                </div>
              </div>

              {/* Current Settings Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Settings</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Email enabled: {notificationPreferences.email ? 'Yes' : 'No'}</p>
                  <p>SMS enabled: {notificationPreferences.sms ? 'Yes' : 'No'}</p>
                  <p>Push notifications: {notificationPreferences.push ? 'Yes' : 'No'}</p>
                  <p>Remind before: {notificationPreferences.reminder_before} minutes</p>
                  <p>Timezone: {userSettings?.timezone || 'UTC'}</p>
                  <p>Preferred times: {userSettings?.preferred_times?.join(', ') || '08:00, 14:00, 20:00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
