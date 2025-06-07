import { Reminder } from '../../types/reminder';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, Send } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ReminderListProps {
  reminders: Reminder[];
  onReminderDeleted: (reminderId: string) => void;
  onReminderSent: (reminderId: string) => void;
}

export const ReminderList = ({ reminders, onReminderDeleted, onReminderSent }: ReminderListProps) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No tienes recordatorios programados
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{reminder.medications?.name || 'Medicamento'}</h3>
                <Badge variant={getStatusVariant(reminder.status)}>
                  {getStatusText(reminder.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(reminder.scheduled_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric'
                })} a las {reminder.scheduled_time}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReminderSent(reminder.id)}
                title="Enviar recordatorio"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReminderDeleted(reminder.id)}
                title="Eliminar recordatorio"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardContent>
            {reminder.message && (
              <p className="text-sm text-muted-foreground">{reminder.message}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 