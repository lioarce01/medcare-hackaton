import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useReminders, useCreateReminder, useDeleteReminder, useSendReminderManually } from '../api/reminders';
import { CreateReminder } from '../components/reminders/CreateReminder';
import { ReminderList } from '../components/reminders/ReminderList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const RemindersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const { data: reminders = [] } = useReminders();
  const createReminder = useCreateReminder();
  const deleteReminder = useDeleteReminder();
  const sendReminderManually = useSendReminderManually();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id);
      showToast("El recordatorio ha sido eliminado correctamente", "success");
    } catch (error) {
      showToast("No se pudo eliminar el recordatorio", "error");
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await sendReminderManually.mutateAsync(id);
      showToast("El recordatorio ha sido enviado correctamente", "success");
    } catch (error) {
      showToast("No se pudo enviar el recordatorio", "error");
    }
  };

  if (user?.subscription_status !== 'premium') {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Recordatorios Premium</CardTitle>
            <CardDescription>
              Actualiza tu cuenta para acceder a todas las funciones de recordatorios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Con una cuenta premium podrás:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Crear recordatorios ilimitados</li>
                <li>Recibir notificaciones por email</li>
                <li>Personalizar mensajes de recordatorio</li>
                <li>Acceder a reportes semanales</li>
                <li>Y mucho más...</li>
              </ul>
              <Button 
                className="w-full mt-4"
                onClick={() => navigate('/subscription')}
              >
                Actualizar a Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="create">Crear Recordatorio</TabsTrigger>
          <TabsTrigger value="list">Mis Recordatorios</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Recordatorio</CardTitle>
              <CardDescription>
                Programa un recordatorio para tu medicamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateReminder onReminderCreated={createReminder.mutate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Mis Recordatorios</CardTitle>
              <CardDescription>
                Gestiona todos tus recordatorios programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReminderList 
                reminders={reminders}
                onReminderDeleted={handleDeleteReminder}
                onReminderSent={handleSendReminder}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 