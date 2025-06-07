import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Reminder } from "../../types/reminder";
import { useMedications } from "../../hooks/useMedications";

interface CreateReminderProps {
  onReminderCreated: (data: Omit<Reminder, "id" | "user_id" | "created_at" | "updated_at">) => void;
}

export const CreateReminder = ({ onReminderCreated }: CreateReminderProps) => {
  const [formData, setFormData] = useState({
    medication_id: "",
    scheduled_date: "",
    scheduled_time: "",
    message: "",
  });

  const { data: medications = { all: [] } } = useMedications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medication_id || !formData.scheduled_date || !formData.scheduled_time) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar que la fecha y hora no sean nulas
    const scheduledTime = formData.scheduled_time.trim();
    const scheduledDate = formData.scheduled_date.trim();
    
    if (!scheduledTime || !scheduledDate) {
      alert("La fecha y hora son requeridas");
      return;
    }

    const selectedMedication = medications.all.find(m => m.id === formData.medication_id);
    
    // Formatear la hora a HH:mm
    const [hours, minutes] = scheduledTime.split(':');
    const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    
    // Combinar fecha y hora en formato ISO con timezone UTC
    const scheduledDateTime = `${scheduledDate}T${formattedTime}:00.000000+00`;
    
    const reminderData = {
      medication_id: formData.medication_id,
      scheduled_date: scheduledDateTime, // Fecha y hora en formato ISO con timezone UTC
      scheduled_time: formattedTime, // Hora en formato HH:mm
      message: formData.message || undefined,
      status: "pending" as const,
      channels: {
        email: { sent: false, enabled: true },
        sms: { sent: false, enabled: false }
      },
      retry_count: 0,
      medications: selectedMedication ? {
        name: selectedMedication.name,
        dosage: selectedMedication.dosage,
        instructions: selectedMedication.instructions
      } : { name: "", dosage: "", instructions: "" }
    };
    
    console.log('Sending reminder data:', reminderData);
    onReminderCreated(reminderData);
    setFormData({
      medication_id: "",
      scheduled_date: "",
      scheduled_time: "",
      message: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Medicamento</label>
        <Select
          name="medication_id"
          value={formData.medication_id}
          onChange={handleChange}
        >
          <option value="">Selecciona un medicamento</option>
          {medications.all.map((medication) => (
            <option key={medication.id} value={medication.id}>
              {medication.name} - {medication.dosage.amount} {medication.dosage.unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Fecha</label>
        <Input
          type="date"
          name="scheduled_date"
          value={formData.scheduled_date}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Hora</label>
        <Input
          type="time"
          name="scheduled_time"
          value={formData.scheduled_time}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mensaje (opcional)</label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" className="w-full">
        Crear Recordatorio
      </Button>
    </form>
  );
}; 