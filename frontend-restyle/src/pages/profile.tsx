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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Bell,
  Clock,
  Crown,
  Shield,
  Download,
  Edit3,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { mockUserSettings } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { UserSettings } from '@/types';

export function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    allergies: [] as string[],
    conditions: [] as string[],
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setUserSettings(mockUserSettings);
      if (user) {
        setEditedProfile({
          name: user.name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          date_of_birth: user.date_of_birth || '',
          gender: user.gender || '',
          allergies: user.allergies || [],
          conditions: user.conditions || [],
          emergency_contact: user.emergency_contact || {
            name: '',
            phone: '',
            relationship: ''
          }
        });
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log('Saving profile:', editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditedProfile({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        allergies: user.allergies || [],
        conditions: user.conditions || [],
        emergency_contact: user.emergency_contact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
    setIsEditing(false);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    if (userSettings) {
      setUserSettings({ ...userSettings, ...newSettings });
    }
  };

  const handleExportData = () => {
    // In a real app, this would generate and download a PDF
    console.log('Exporting user data...');
    alert('Data export feature will be available soon. You will receive an email with your data within 30 days.');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'family':
        return 'bg-gradient-to-r from-blue-400 to-purple-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          <TabsTrigger value="settings">Reminder Settings</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and medical information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editedProfile.phone_number}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editedProfile.date_of_birth ? editedProfile.date_of_birth.split('T')[0] : ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={editedProfile.gender} 
                    onValueChange={(value) => setEditedProfile(prev => ({ ...prev, gender: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical Information</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="List your allergies (comma-separated)"
                      value={editedProfile.allergies.join(', ')}
                      onChange={(e) => setEditedProfile(prev => ({ 
                        ...prev, 
                        allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                      }))}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions">Medical Conditions</Label>
                    <Textarea
                      id="conditions"
                      placeholder="List your medical conditions (comma-separated)"
                      value={editedProfile.conditions.join(', ')}
                      onChange={(e) => setEditedProfile(prev => ({ 
                        ...prev, 
                        conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                      }))}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-name">Name</Label>
                    <Input
                      id="emergency-name"
                      value={editedProfile.emergency_contact.name}
                      onChange={(e) => setEditedProfile(prev => ({ 
                        ...prev, 
                        emergency_contact: { ...prev.emergency_contact, name: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency-phone">Phone</Label>
                    <Input
                      id="emergency-phone"
                      value={editedProfile.emergency_contact.phone}
                      onChange={(e) => setEditedProfile(prev => ({ 
                        ...prev, 
                        emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency-relationship">Relationship</Label>
                    <Input
                      id="emergency-relationship"
                      value={editedProfile.emergency_contact.relationship}
                      onChange={(e) => setEditedProfile(prev => ({ 
                        ...prev, 
                        emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive medication reminders
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
                      checked={userSettings?.notification_preferences.email}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({
                          notification_preferences: {
                            ...userSettings?.notification_preferences!,
                            email: checked
                          }
                        })
                      }
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
                      checked={userSettings?.notification_preferences.sms}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({
                          notification_preferences: {
                            ...userSettings?.notification_preferences!,
                            sms: checked
                          }
                        })
                      }
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
                      checked={userSettings?.notification_preferences.push}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({
                          notification_preferences: {
                            ...userSettings?.notification_preferences!,
                            push: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Timing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reminder Timing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-before">Remind me before</Label>
                    <Select
                      value={userSettings?.notification_preferences.reminder_before.toString()}
                      onValueChange={(value) =>
                        handleUpdateSettings({
                          notification_preferences: {
                            ...userSettings?.notification_preferences!,
                            reminder_before: parseInt(value)
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">At the scheduled time</SelectItem>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="10">10 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={userSettings?.timezone}
                      onValueChange={(value) => handleUpdateSettings({ timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preferred Times */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferred Reminder Times</h3>
                <p className="text-sm text-muted-foreground">
                  Set your preferred times for medication reminders. These will be suggested when creating new medications.
                </p>
                <div className="grid gap-2 md:grid-cols-4">
                  {userSettings?.preferred_times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...userSettings.preferred_times];
                          newTimes[index] = e.target.value;
                          handleUpdateSettings({ preferred_times: newTimes });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${getSubscriptionColor(user?.subscription_plan || 'free')} flex items-center justify-center`}>
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {user?.subscription_plan || 'Free'} Plan
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{user?.subscription_status || 'inactive'}</span>
                      </p>
                      {user?.subscription_expires_at && (
                        <p className="text-sm text-muted-foreground">
                          Expires: {format(new Date(user.subscription_expires_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={user?.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {user?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plan Features</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Basic medication tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Email reminders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Adherence calendar</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user?.subscription_features?.analytics ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={!user?.subscription_features?.analytics ? 'text-muted-foreground' : ''}>
                        Advanced analytics
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {user?.subscription_features?.export ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={!user?.subscription_features?.export ? 'text-muted-foreground' : ''}>
                        Data export
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {user?.subscription_features?.family_sharing ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={!user?.subscription_features?.family_sharing ? 'text-muted-foreground' : ''}>
                        Family sharing
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Options */}
              {user?.subscription_plan !== 'premium' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Upgrade Your Plan</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-2 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-600" />
                          Premium Plan
                        </CardTitle>
                        <CardDescription>
                          Unlock all features for better medication management
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal">/month</span></p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Advanced analytics & insights
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              SMS reminders
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Data export (PDF reports)
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Priority support
                            </li>
                          </ul>
                          <Button className="w-full">Upgrade to Premium</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-blue-600" />
                          Family Plan
                        </CardTitle>
                        <CardDescription>
                          Perfect for families managing multiple medications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-2xl font-bold">$19.99<span className="text-sm font-normal">/month</span></p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              All Premium features
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Up to 6 family members
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Family dashboard
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Caregiver notifications
                            </li>
                          </ul>
                          <Button className="w-full">Upgrade to Family</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6"> 
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Manage your data privacy settings and export your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              {/* Data Export */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Data Export</h3>
                <div className="p-4 border rounded-lg bg-info-light">
                  <div className="flex items-start gap-4">
                    <Download className="h-6 w-6 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">Export Your Data</h4>
                      <p className="text-sm mb-4 opacity-90">
                        Download a comprehensive report of your medication data, adherence history,
                        and account information in PDF format. This report will be generated and
                        sent to your email within 30 days.
                      </p>
                      <Button onClick={handleExportData} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Request Data Export
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 pr-4">
                      <p className="font-medium">Analytics & Usage Data</p>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect anonymous usage data to improve the app
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 pr-4">
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and health tips
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 pr-4">
                      <p className="font-medium">Data Sharing with Healthcare Providers</p>
                      <p className="text-sm text-muted-foreground">
                        Allow sharing of adherence data with your healthcare team
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Account Actions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-warning-light border rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium">
                          Data Retention Policy
                        </h4>
                        <p className="text-sm mt-1 opacity-90">
                          Your medication data is stored securely and retained for as long as your account
                          is active. You can request deletion of your data at any time by contacting support.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800 dark:text-red-200">
                          Delete Account
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1 mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Privacy Contact</h3>
                <div className="p-4 border rounded-lg bg-purple-light">
                  <p className="text-sm opacity-90">
                    If you have any questions about your privacy or data handling, please contact our
                    privacy team at{' '}
                    <a href="mailto:privacy@meditrack.com" className="font-medium hover:underline">
                      privacy@meditrack.com
                    </a>
                    {' '}or review our{' '}
                    <a href="#" className="font-medium hover:underline">
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a href="#" className="font-medium hover:underline">
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
