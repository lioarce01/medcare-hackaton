import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Bell,
  Clock,
  Shield,
  Download,
  Edit3,
  Save,
  X,
  AlertTriangle,

  Loader2,
} from 'lucide-react';
import { User as UserType, UserSettings } from '@/types';
import { SubscriptionStatus } from '@/components/premium/subscription-status';
import {
  useUserProfile,
  useUpdateUserProfile,
  useUpdateUserSettings,
  useDeleteUser
} from '@/hooks/useUser'
import { toast } from 'sonner';
import ExportUserDataCall from '@/components/pdf/ExportUserDataCall';

interface EditedProfile {
  name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  allergies: string[];
  conditions: string[];
  emergency_contact: {
    name: string;
    phone_number: string;
    relationship: string;
  };
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminder_before: number;
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditedProfile>({
    name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    allergies: [],
    conditions: [],
    emergency_contact: {
      name: '',
      phone_number: '',
      relationship: ''
    }
  });

  // API hooks
  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const updateSettingsMutation = useUpdateUserSettings();
  const deleteUserMutation = useDeleteUser();

  console.log("user profile:", userProfile)

  // Initialize form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || '',
        date_of_birth: userProfile.date_of_birth || '',
        gender: userProfile.gender || '',
        allergies: userProfile.allergies || [],
        conditions: userProfile.conditions || [],
        emergency_contact: {
          name: userProfile.emergency_contact?.name || '',
          phone_number: userProfile.emergency_contact?.phone_number || '',
          relationship: userProfile.emergency_contact?.relationship || ''
        }
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        id: userProfile.id,
        ...editedProfile
      });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || '',
        date_of_birth: userProfile.date_of_birth || '',
        gender: userProfile.gender || '',
        allergies: userProfile.allergies || [],
        conditions: userProfile.conditions || [],
        emergency_contact: {
          name: userProfile.emergency_contact?.name || '',
          phone_number: userProfile.emergency_contact?.phone_number || '',
          relationship: userProfile.emergency_contact?.relationship || ''
        }
      });
    }
    setIsEditing(false);
  };

  const handleUpdateNotificationSettings = async (newSettings: Partial<NotificationPreferences>) => {
    if (!userProfile?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        userId: userProfile.id,
        settings: {
          notification_preferences: {
            ...userProfile.settings?.notification_preferences,
            ...newSettings
          }
        }
      });
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleUpdateGeneralSettings = async (newSettings: Partial<UserSettings>) => {
    if (!userProfile?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        userId: userProfile.id,
        settings: newSettings
      });
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to update settings:', error);
    }
  };

  const handleExportData = () => {
    // In a real app, this would trigger a backend job to generate and email the data
    toast.info('Data export requested. You will receive an email with your data within 30 days.');
  };

  const handleDeleteAccount = async () => {
    if (!userProfile?.id) {
      toast.error('User ID not found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    );

    if (confirmed) {
      try {
        await deleteUserMutation.mutateAsync(userProfile.id);
        // Redirect to login or home page after successful deletion
        window.location.href = '/';
      } catch (error) {
        // Error handling is done in the mutation
        console.error('Failed to delete account:', error);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle loading state
  if (isLoadingProfile) {
    return <LoadingSkeleton />;
  }

  // Handle error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load profile</h2>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Safe access to notification preferences
  const notificationPreferences: NotificationPreferences = {
    email: userProfile?.settings?.notification_preferences?.email || false,
    sms: userProfile?.settings?.notification_preferences?.sms || false,
    push: userProfile?.settings?.notification_preferences?.push || false,
    reminder_before: userProfile?.settings?.notification_preferences?.reminder_before || 0,
  };

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
              {userProfile ? getInitials(userProfile.name || 'User') : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{userProfile?.name}</p>
            <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
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
                    <Button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2"
                      disabled={updateProfileMutation.isPending}
                    >
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
                      value={editedProfile.emergency_contact.phone_number}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, phone_number: e.target.value }
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-before">Remind me before</Label>
                    <Select
                      value={notificationPreferences.reminder_before.toString()}
                      onValueChange={(value) => handleUpdateNotificationSettings({ reminder_before: parseInt(value) })}
                      disabled={updateSettingsMutation.isPending}
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
                      value={userProfile?.settings?.timezone || 'UTC'}
                      onValueChange={(value) => handleUpdateGeneralSettings({ timezone: value })}
                      disabled={updateSettingsMutation.isPending}
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
                  {(userProfile?.settings?.preferred_times || ['08:00', '12:00', '18:00', '22:00']).map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const currentTimes = userProfile?.settings?.preferred_times || ['08:00', '12:00', '18:00', '22:00'];
                          const newTimes = [...currentTimes];
                          newTimes[index] = e.target.value;
                          handleUpdateGeneralSettings({ preferred_times: newTimes });
                        }}
                        disabled={updateSettingsMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionStatus />
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
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-4">
                    <Download className="h-6 w-6 mt-1 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">Export Your Data</h4>
                      <p className="text-sm mb-4 text-muted-foreground">
                        Download a comprehensive report of your medication data, adherence history,
                        and account information in PDF format. This report will be generated and
                        sent to your email within 30 days.
                      </p>
                      <ExportUserDataCall />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Account Actions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Data Retention Policy
                        </h4>
                        <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteAccount}
                          disabled={deleteUserMutation.isPending}
                        >
                          {deleteUserMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 w-full max-w-2xl">
                <h3 className="text-lg font-semibold">Privacy Contact</h3>
                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-sm text-muted-foreground">
                    If you have any questions about your privacy or data handling, please contact our
                    privacy team at{' '}
                    <a href="mailto:privacy@meditrack.com" className="font-medium hover:underline text-purple-600">
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
