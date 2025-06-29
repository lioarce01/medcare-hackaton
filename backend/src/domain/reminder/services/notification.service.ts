import { Injectable } from '@nestjs/common';
import { Reminder } from '../entities/reminder.entity';

export interface NotificationChannel {
  send(reminder: Reminder): Promise<boolean>;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SMSNotificationData {
  to: string;
  message: string;
}

@Injectable()
export abstract class NotificationService {
  abstract sendEmailReminder(reminder: Reminder): Promise<boolean>;
  abstract sendSMSReminder(reminder: Reminder): Promise<boolean>;
  abstract sendWelcomeEmail(email: string, name: string): Promise<boolean>;
  abstract sendSubscriptionConfirmation(
    email: string,
    name: string,
    plan: string,
  ): Promise<boolean>;
  abstract sendWeeklyReport(userId: string): Promise<boolean>;

  protected formatDosage(dosage: any): string {
    if (typeof dosage === 'object' && dosage.amount && dosage.unit) {
      return `${dosage.amount} ${dosage.unit}`;
    }
    return dosage?.toString() || 'N/A';
  }

  protected buildEmailReminderData(reminder: Reminder): EmailNotificationData {
    const dosage = this.formatDosage(reminder.medication?.dosage);
    const userName = reminder.user?.user?.name || 'Usuario';
    const medicationName = reminder.medication?.name || 'Medicamento';
    const instructions =
      reminder.medication?.instructions || 'Sin instrucciones específicas';

    return {
      to: reminder.user?.user?.email || '',
      subject: 'Recordatorio de Medicamento',
      text: `Hola ${userName},\n\nEs hora de tomar tu medicamento:\n\nMedicamento: ${medicationName}\nDosis: ${dosage}\nInstrucciones: ${instructions}\n\nSaludos,\nTu equipo de MedCare`,
      html: `
        <h2>Recordatorio de Medicamento</h2>
        <p>Hola ${userName},</p>
        <p>Es hora de tomar tu medicamento:</p>
        <ul>
          <li><strong>Medicamento:</strong> ${medicationName}</li>
          <li><strong>Dosis:</strong> ${dosage}</li>
          <li><strong>Instrucciones:</strong> ${instructions}</li>
        </ul>
        <p>Saludos,<br>Tu equipo de MedCare</p>
      `,
    };
  }

  protected buildSMSReminderData(reminder: Reminder): SMSNotificationData {
    const dosage = this.formatDosage(reminder.medication?.dosage);
    const medicationName = reminder.medication?.name || 'Medicamento';

    return {
      to: reminder.user?.user?.phone_number || '',
      message: `MedCare: Es hora de tomar ${medicationName} - ${dosage}. ¡No olvides tu medicamento!`,
    };
  }
}
