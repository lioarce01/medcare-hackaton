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
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserSettings } from '@/types';
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

  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
  const [detectedTimezone, setDetectedTimezone] = useState(getUserTimezone());

  const handleRefreshTimezone = async () => {
    const newTimezone = getUserTimezone();
    setDetectedTimezone(newTimezone);

    if (userProfile?.id && newTimezone !== userProfile?.settings?.timezone) {
      try {
        await handleUpdateSettings({ timezone: newTimezone });
        toast.success('Timezone updated successfully');
      } catch (error) {
        toast.error('Failed to update timezone');
      }
    }
  };

  // API hooks
  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const updateSettingsMutation = useUpdateUserSettings();
  const deleteUserMutation = useDeleteUser();

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
      // Ensure we have default notification preferences if they don't exist
      const currentPreferences = userProfile.settings?.notification_preferences &&
        Object.keys(userProfile.settings.notification_preferences).length > 0
        ? userProfile.settings.notification_preferences
        : {
          email: true,
          sms: false,
          push: false,
          reminder_before: 15,
        };

      const mergedPreferences: NotificationPreferences = {
        ...currentPreferences,
        ...newSettings
      };

      // Ensure we're not sending an empty object
      if (Object.keys(mergedPreferences).length === 0) {
        toast.error("Invalid notification preferences");
        return;
      }

      // Ensure all required properties are present
      const requiredProperties: (keyof NotificationPreferences)[] = ['email', 'sms', 'push', 'reminder_before'];
      const missingProperties = requiredProperties.filter(
        (prop) => mergedPreferences[prop] === undefined
      );

      if (missingProperties.length > 0) {
        toast.error("Invalid notification preferences");
        return;
      }

      const settingsToSend = {
        notification_preferences: mergedPreferences
      };

      await updateSettingsMutation.mutateAsync(settingsToSend);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!userProfile?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync(newSettings);
    } catch (error) {
      // Error handling is done in the mutation
    }
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

  // Safe access to notification preferences
  const notificationPreferences: NotificationPreferences = {
    email: userProfile?.settings?.notification_preferences?.email ?? true,
    sms: userProfile?.settings?.notification_preferences?.sms ?? false,
    push: userProfile?.settings?.notification_preferences?.push ?? false,
    reminder_before: userProfile?.settings?.notification_preferences?.reminder_before ?? 15,
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
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
                  <div className="relative">
                    <Input
                      id="dob"
                      type="date"
                      value={editedProfile.date_of_birth ? editedProfile.date_of_birth.split('T')[0] : ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
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
                    <Label htmlFor="emergency-phone">Phone Number</Label>
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

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionStatus />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Export & Privacy
              </CardTitle>
              <CardDescription>
                Export your data or manage your privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download all your data in PDF format
                      </p>
                    </div>
                  </div>
                  <ExportUserDataCall />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}