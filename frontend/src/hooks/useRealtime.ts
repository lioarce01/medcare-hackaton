import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService, RealtimeSubscriptionConfig } from '../services/realtime';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Generic real-time hook
export const useRealtimeSubscription = (config: RealtimeSubscriptionConfig) => {
  const channelIdRef = useRef<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time changes
    const channelId = realtimeService.subscribe(config);
    channelIdRef.current = channelId;

    return () => {
      if (channelIdRef.current) {
        realtimeService.unsubscribe(channelIdRef.current);
      }
    };
  }, [user, config.table, config.filter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelIdRef.current) {
        realtimeService.unsubscribe(channelIdRef.current);
      }
    };
  }, []);
};

// Real-time medications updates
export const useRealtimeMedications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useRealtimeSubscription({
    table: 'medications',
    filter: user ? `user_id=eq.${user.id}` : '',
    onInsert: (medication) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success(`New medication "${medication.name}" added`);
    },
    onUpdate: ({ new: newMedication }) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.setQueryData(['medications', newMedication.id], newMedication);
      toast.info(`Medication "${newMedication.name}" updated`);
    },
    onDelete: (medication) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.info(`Medication "${medication.name}" removed`);
    },
  });
};

// Real-time adherence updates
export const useRealtimeAdherence = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useRealtimeSubscription({
    table: 'adherence',
    filter: user ? `user_id=eq.${user.id}` : '',
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: ['adherence'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onUpdate: ({ new: newAdherence }) => {
      queryClient.invalidateQueries({ queryKey: ['adherence'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      // Show notification based on status
      if (newAdherence.status === 'taken') {
        toast.success('Dose confirmed!');
      } else if (newAdherence.status === 'skipped') {
        toast.info('Dose skipped');
      }
    },
  });
};

// Real-time reminders updates
export const useRealtimeReminders = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useRealtimeSubscription({
    table: 'reminders',
    filter: user ? `user_id=eq.${user.id}` : '',
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onUpdate: ({ new: newReminder }) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });

      // Show notification when reminder is sent
      if (newReminder.status === 'sent') {
        toast.success('Reminder sent successfully');
      } else if (newReminder.status === 'failed') {
        toast.error('Failed to send reminder');
      }
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.info('Reminder deleted');
    },
  });
};

// Real-time user profile updates
export const useRealtimeUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useRealtimeSubscription({
    table: 'profiles',
    filter: user ? `id=eq.${user.id}` : '',
    onUpdate: ({ new: newProfile }) => {
      queryClient.setQueryData(['userProfile'], newProfile);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated');
    },
  });
};

// Hook to enable all real-time subscriptions
export const useRealtimeSubscriptions = () => {
  useRealtimeMedications();
  useRealtimeAdherence();
  useRealtimeReminders();
  useRealtimeUserProfile();
};
