import { useEffect, useRef } from 'react';
import { useAuth } from './useAuthContext';
import { supabase } from '../config/supabase';
import { queryClient } from '../lib/query-client';
import { toast } from 'sonner';

// Singleton para manejar las suscripciones globalmente
class RealtimeSubscriptionManager {
  private static instance: RealtimeSubscriptionManager;
  private subscriptions: Map<string, any> = new Map();
  private currentUserId: string | null = null;

  static getInstance(): RealtimeSubscriptionManager {
    if (!RealtimeSubscriptionManager.instance) {
      RealtimeSubscriptionManager.instance = new RealtimeSubscriptionManager();
    }
    return RealtimeSubscriptionManager.instance;
  }

  private cleanupSubscriptions() {
    this.subscriptions.forEach((subscription, _) => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();
  }

  setupSubscriptions(userId: string) {
    // Si ya tenemos suscripciones para este usuario, no hacer nada
    if (this.currentUserId === userId && this.subscriptions.size > 0) {
      return;
    }

    // Limpiar suscripciones anteriores si hay un usuario diferente
    if (this.currentUserId !== userId) {
      this.cleanupSubscriptions();
    }

    this.currentUserId = userId;

    // Configurar subscripciones para datos del usuario
    const medicationsSubscription = supabase
      .channel(`medications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['medications'] });

          // Show toast notifications based on event type
          if (payload.eventType === 'INSERT') {
            toast.success(`New medication "${payload.new.name}" added`);
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Medication "${payload.new.name}" updated`);
          } else if (payload.eventType === 'DELETE') {
            toast.info(`Medication "${payload.old.name}" removed`);
          }
        }
      )
      .subscribe();

    const remindersSubscription = supabase
      .channel(`reminders_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['reminders'] });

          // Show toast notifications based on event type
          if (payload.eventType === 'INSERT') {
            toast.success('New reminder created');
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'sent') {
              toast.success('Reminder sent successfully');
            } else if (payload.new.status === 'failed') {
              toast.error('Failed to send reminder');
            }
          } else if (payload.eventType === 'DELETE') {
            toast.info('Reminder deleted');
          }
        }
      )
      .subscribe();

    const adherenceSubscription = supabase
      .channel(`adherence_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adherence',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['adherence'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });

          // Show toast notifications based on event type
          if (payload.eventType === 'INSERT') {
            if (payload.new.status === 'taken') {
              toast.success('Dose confirmed!');
            } else if (payload.new.status === 'skipped') {
              toast.info('Dose skipped');
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'taken') {
              toast.success('Dose confirmed!');
            } else if (payload.new.status === 'skipped') {
              toast.info('Dose skipped');
            }
          }
        }
      )
      .subscribe();

    // Guardar referencias
    this.subscriptions.set('medications', medicationsSubscription);
    this.subscriptions.set('reminders', remindersSubscription);
    this.subscriptions.set('adherence', adherenceSubscription);
  }

  cleanup() {
    this.cleanupSubscriptions();
    this.currentUserId = null;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const useRealtimeSubscriptions = () => {
  const { isAuthenticated, user } = useAuth();
  const manager = RealtimeSubscriptionManager.getInstance();
  const hasSetupRef = useRef(false);

  useEffect(() => {
    // Solo configurar subscripciones si el usuario está autenticado
    if (!isAuthenticated || !user) {
      if (hasSetupRef.current) {
        manager.cleanup();
        hasSetupRef.current = false;
      }
      return;
    }

    // Evitar configuraciones múltiples para el mismo usuario
    if (hasSetupRef.current && manager.getCurrentUserId() === user.id) {
      return;
    }

    // Configurar suscripciones
    manager.setupSubscriptions(user.id);
    hasSetupRef.current = true;

    // Cleanup function
    return () => {
      // Solo limpiar si el usuario cambia o se desmonta el componente
      if (manager.getCurrentUserId() !== user.id) {
        manager.cleanup();
        hasSetupRef.current = false;
      }
    };
  }, [isAuthenticated, user?.id]);

  // Cleanup en unmount del componente
  useEffect(() => {
    return () => {
      // Solo limpiar si este es el último componente que usa las suscripciones
      // En una aplicación real, podrías usar un contador de referencias
    };
  }, []);
};
