import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useUpdateReminderSettings, useUserSettings } from '../../api/reminders';
import { useToast } from '../../hooks/useToast';
import type { ReminderSettings as ReminderSettingsType } from '../../types/reminder';
import { Bell, Clock } from 'lucide-react';

export const ReminderSettings = () => {
  const { showToast } = useToast();
  const updateSettings = useUpdateReminderSettings();
  const { data: userSettings } = useUserSettings();
  const [settings, setSettings] = useState<ReminderSettingsType>({
    emailEnabled: true,
    preferredTimes: ['08:00', '14:00', '20:00'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationPreferences: {
      email: true,
      push: false
    }
  });
  const [localTimes, setLocalTimes] = useState<string[]>([]);

  useEffect(() => {
    if (userSettings) {
      // Actualizar la zona horaria local
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      setSettings(prev => ({
        ...userSettings,
        timezone: localTimezone // Forzar la zona horaria local
      }));

      // Convertir las horas UTC a hora local
      const localTimeArray = userSettings.preferredTimes.map(time => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setUTCHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      });
      setLocalTimes(localTimeArray);
    }
  }, [userSettings]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (type: 'email' | 'push') => {
    setSettings(prev => ({
      ...prev,
      emailEnabled: type === 'email' ? !prev.emailEnabled : prev.emailEnabled,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: !prev.notificationPreferences[type]
      }
    }));
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const newTimes = [...localTimes];
    newTimes[index] = newTime;
    setLocalTimes(newTimes);
  };

  const addTimeSlot = () => {
    setSettings(prev => ({
      ...prev,
      preferredTimes: [...prev.preferredTimes, '12:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setSettings(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Obtener la zona horaria local actual
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Convertir las horas locales a UTC antes de guardar
      const utcTimes = localTimes.map(time => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toISOString().slice(11, 16);
      });

      const settingsToUpdate = {
        emailEnabled: settings.emailEnabled,
        preferredTimes: utcTimes,
        timezone: localTimezone, // Usar la zona horaria local actual
        notificationPreferences: settings.notificationPreferences
      };
      
      await updateSettings.mutateAsync(settingsToUpdate);
      showToast("Configuración guardada exitosamente", "success");
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast("Error al guardar la configuración", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notificaciones por Email</Label>
            <p className="text-sm text-muted-foreground">
              Recibe recordatorios por correo electrónico
            </p>
          </div>
          <Switch
            checked={settings.notificationPreferences.email}
            onCheckedChange={() => handleToggle('email')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notificaciones Push</Label>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones en tu dispositivo
            </p>
          </div>
          <Switch
            checked={settings.notificationPreferences.push}
            onCheckedChange={() => handleToggle('push')}
          />
        </div>

        <div className="space-y-2">
          <Label>Horarios preferidos</Label>
          <p className="text-sm text-muted-foreground">
            Selecciona los horarios en los que prefieres recibir recordatorios
          </p>
          
          {localTimes.map((time, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTimeSlot(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTimeSlot}
          >
            Agregar horario
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Zona horaria</Label>
          <Input
            type="text"
            value={settings.timezone}
            disabled
          />
          <p className="text-sm text-muted-foreground">
            Tu zona horaria actual: {settings.timezone}
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </form>
  );
}; 