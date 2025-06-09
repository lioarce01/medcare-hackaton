import { useState, useEffect } from 'react';
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
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { allMockReminders, mockMedications } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { Reminder, Medication } from '@/types';

export function RemindersPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state for creating reminders
  const [formData, setFormData] = useState({
    medication_id: '',
    scheduled_date: '',
    scheduled_time: '',
    message: '',
    email_enabled: true,
    sms_enabled: false,
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setReminders(allMockReminders);
      setMedications(mockMedications);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateReminder = () => {
    if (!formData.medication_id || !formData.scheduled_date || !formData.scheduled_time) {
      return;
    }

    const selectedMedication = medications.find(med => med.id === formData.medication_id);
    if (!selectedMedication) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      user_id: user?.id || 'user-1',
      medication_id: formData.medication_id,
      scheduled_time: formData.scheduled_time,
      scheduled_date: formData.scheduled_date,
      status: 'pending',
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
      retry_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setReminders(prev => [newReminder, ...prev]);
    setFormData({
      medication_id: '',
      scheduled_date: '',
      scheduled_time: '',
      message: '',
      email_enabled: true,
      sms_enabled: false,
    });
    setActiveTab('list');
  };

  const handleSendReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { 
              ...reminder, 
              status: 'sent',
              channels: {
                ...reminder.channels,
                email: { ...reminder.channels.email, sent: reminder.channels.email.enabled },
                sms: { ...reminder.channels.sms, sent: reminder.channels.sms.enabled }
              },
              updated_at: new Date().toISOString()
            }
          : reminder
      )
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const filteredReminders = reminders.filter(reminder => {
    const medication = medications.find(med => med.id === reminder.medication_id);
    const matchesSearch = medication?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

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

  if (isLoading) {
    return <LoadingSkeleton />;
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Reminders List</TabsTrigger>
          <TabsTrigger value="create">Create Reminder</TabsTrigger>
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
              filteredReminders.map((reminder) => {
                const medication = medications.find(med => med.id === reminder.medication_id);
                
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
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(reminder.scheduled_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{reminder.scheduled_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Email: {reminder.channels.email.enabled ? 
                              (reminder.channels.email.sent ? 'Sent' : 'Enabled') : 
                              'Disabled'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            SMS: {reminder.channels.sms.enabled ? 
                              (reminder.channels.sms.sent ? 'Sent' : 'Enabled') : 
                              'Disabled'
                            }
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
                                  - Last attempt: {format(new Date(reminder.last_retry), 'MMM d, h:mm a')}
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
                      {medications.map((medication) => (
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
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
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
                      <strong>Medication:</strong> {medications.find(m => m.id === formData.medication_id)?.name}
                    </p>
                    <p>
                      <strong>Date & Time:</strong> {format(new Date(formData.scheduled_date), 'EEEE, MMMM d, yyyy')} at {formData.scheduled_time}
                    </p>
                    <p>
                      <strong>Message:</strong> {formData.message || `Time to take your ${medications.find(m => m.id === formData.medication_id)?.name}`}
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
      </Tabs>
    </div>
  );
}
