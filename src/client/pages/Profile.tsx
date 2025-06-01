import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Bell, Phone, Heart } from 'lucide-react';
import { userApi } from '../utils/api';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    allergies: [] as string[],
    conditions: [] as string[],
    phoneNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
    },
    preferredReminderTime: ['08:00', '12:00', '18:00'],
    emailNotificationsEnabled: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await userApi.getProfile();
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          allergies: data.allergies || [],
          conditions: data.conditions || [],
          phoneNumber: data.phone_number || '',
          emergencyContact: data.emergency_contact || {
            name: '',
            relationship: '',
            phoneNumber: '',
          },
          preferredReminderTime: data.preferred_reminder_time || ['08:00', '12:00', '18:00'],
          emailNotificationsEnabled: data.email_notifications_enabled ?? true,
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userApi.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (e: React.KeyboardEvent<HTMLInputElement>, field: 'allergies' | 'conditions') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], value]
        }));
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const removeArrayItem = (field: 'allergies' | 'conditions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="mr-2" /> Profile Settings
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <Settings className="mr-2" /> Personal Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <Heart className="mr-2" /> Medical Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {allergy}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('allergies', index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Press Enter to add allergy"
                    onKeyDown={(e) => handleArrayInput(e, 'allergies')}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {formData.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {condition}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('conditions', index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Press Enter to add condition"
                    onKeyDown={(e) => handleArrayInput(e, 'conditions')}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Phone className="mr-2" /> Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContact.phoneNumber"
                    value={formData.emergencyContact.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Bell className="mr-2" /> Notification Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotificationsEnabled"
                  checked={formData.emailNotificationsEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailNotificationsEnabled: e.target.checked }))}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Enable email notifications for medication reminders
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Reminder Times</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {['08:00', '12:00', '18:00'].map((time) => (
                    <div key={time} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`time-${time}`}
                        checked={formData.preferredReminderTime.includes(time)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              preferredReminderTime: [...prev.preferredReminderTime, time]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              preferredReminderTime: prev.preferredReminderTime.filter(t => t !== time)
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`time-${time}`} className="ml-2 block text-sm text-gray-700">
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};