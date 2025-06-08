import { useUpcomingReminders } from '../../api/reminders';
import { ReminderList } from './ReminderList';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const UpcomingReminders = () => {
  const { data: reminders } = useUpcomingReminders();

  if (!reminders?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay recordatorios próximos
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Recordatorios</CardTitle>
      </CardHeader>
      <CardContent>
        <ReminderList 
          reminders={reminders || []} 
          onReminderDeleted={() => {}} 
          onReminderSent={() => {}} 
        />
      </CardContent>
    </Card>
  );
}; 