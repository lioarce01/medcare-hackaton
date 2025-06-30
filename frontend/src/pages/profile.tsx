import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Edit3,
  Save,
  X,
  AlertTriangle,
  Calendar,
  Loader2,
  Shield,
  Crown,
  Download,
} from 'lucide-react';
import { SubscriptionStatus } from '@/components/premium/subscription-status';
import {
  useUserProfile,
  useUpdateUserProfile,
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

const defaultEditedProfile: EditedProfile = {
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
};

export function ProfilePage() {
  // Estados
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditedProfile>(defaultEditedProfile);

  // Queries y Mutations
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const deleteUserMutation = useDeleteUser();

  const handleSaveProfile = useCallback(async () => {
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
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }, [userProfile?.id, editedProfile, updateProfileMutation]);

  const handleCancelEdit = useCallback(() => {
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
  }, [userProfile]);

  // Effects
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Enhanced Header Section */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account settings, subscription, and privacy preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {userProfile ? getInitials(userProfile.name || 'User') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{userProfile?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-muted/80 rounded-lg">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Crown className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-base">
                    Update your personal details and medical information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
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
          <div className="space-y-6">
            {/* Subscription Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Subscription Management</h2>
                <p className="text-muted-foreground">
                  View your current plan and manage your subscription
                </p>
              </div>
            </div>

            {/* Subscription Status Component */}
            <div className="bg-gradient-to-br from-background to-muted/30 rounded-xl border p-6">
              <SubscriptionStatus />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="space-y-6">


            <Card className="border shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-600/10 dark:from-blue-500/10 dark:to-blue-600/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Data Export & Privacy
                </CardTitle>
                <CardDescription className="text-base">
                  Export your data or manage your privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 hover:from-blue-100 dark:hover:from-blue-950/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Export Your Data</p>
                        <p className="text-sm text-muted-foreground">
                          Download all your data in PDF format
                        </p>
                      </div>
                    </div>
                    <ExportUserDataCall />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/30 hover:from-red-100 dark:hover:from-red-950/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}