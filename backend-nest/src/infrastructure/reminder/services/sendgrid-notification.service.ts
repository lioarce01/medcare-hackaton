import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { NotificationService } from 'src/domain/reminder/services/notification.service';
import { Reminder } from 'src/domain/reminder/entities/reminder.entity';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SendGridNotificationService extends NotificationService {
  private readonly logger = new Logger(SendGridNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super();
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY not configured');
    }
  }

  async sendEmailReminder(reminder: Reminder): Promise<boolean> {
    try {
      if (!reminder.user?.user?.email) {
        throw new Error('User email not found');
      }

      const emailData = this.buildEmailReminderData(reminder);

      const msg = {
        to: emailData.to,
        from:
          this.configService.get<string>('EMAIL_FROM') || 'noreply@medcare.com',
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email reminder sent to ${emailData.to}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email reminder:', error);
      throw error;
    }
  }

  async sendSMSReminder(reminder: Reminder): Promise<boolean> {
    // SMS implementation would go here (Twilio, etc.)
    this.logger.warn('SMS functionality not implemented yet');
    return false;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from:
          this.configService.get<string>('EMAIL_FROM') || 'noreply@medcare.com',
        subject: 'Bienvenido a MedCare',
        text: `Hola ${name},\n\nGracias por registrarte en MedCare. Estamos aquí para ayudarte a mantener un mejor control de tu salud.\n\nCon tu cuenta gratuita, puedes:\n- Registrar tus medicamentos\n- Recibir recordatorios básicos\n- Acceder a tu historial de medicamentos\n\n¡Actualiza a Premium para obtener más beneficios!\n\nSaludos,\nTu equipo de MedCare`,
        html: `
          <h2>¡Bienvenido a MedCare!</h2>
          <p>Hola ${name},</p>
          <p>Gracias por registrarte en MedCare. Estamos aquí para ayudarte a mantener un mejor control de tu salud.</p>
          <p>Con tu cuenta gratuita, puedes:</p>
          <ul>
            <li>Registrar tus medicamentos</li>
            <li>Recibir recordatorios básicos</li>
            <li>Acceder a tu historial de medicamentos</li>
          </ul>
          <p>¡Actualiza a Premium para obtener más beneficios!</p>
          <p>Saludos,<br>Tu equipo de MedCare</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendSubscriptionConfirmation(
    email: string,
    name: string,
    plan: string,
  ): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from:
          this.configService.get<string>('EMAIL_FROM') || 'noreply@medcare.com',
        subject: 'Confirmación de suscripción Premium',
        text: `Hola ${name},\n\n¡Gracias por actualizar a Premium!\n\nTu suscripción Premium ha sido activada. Ahora tienes acceso a:\n- Recordatorios por email y SMS\n- Notificaciones prioritarias\n- Notificaciones para familiares\n- Sonidos personalizados\n- Y mucho más...\n\nSaludos,\nTu equipo de MedCare`,
        html: `
          <h2>¡Gracias por actualizar a Premium!</h2>
          <p>Hola ${name},</p>
          <p>Tu suscripción Premium ha sido activada. Ahora tienes acceso a:</p>
          <ul>
            <li>Recordatorios por email y SMS</li>
            <li>Notificaciones prioritarias</li>
            <li>Notificaciones para familiares</li>
            <li>Sonidos personalizados</li>
            <li>Y mucho más...</li>
          </ul>
          <p>Saludos,<br>Tu equipo de MedCare</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Subscription confirmation sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending subscription confirmation:', error);
      throw error;
    }
  }

  async sendWeeklyReport(userId: string): Promise<boolean> {
    try {
      // Get user information
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get reminders from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const reminders = await this.prisma.reminders.findMany({
        where: {
          user_id: userId,
          scheduled_datetime: { gte: oneWeekAgo },
        },
        include: {
          medications: {
            select: { name: true, dosage: true },
          },
        },
        orderBy: [{ scheduled_datetime: 'asc' }],
      });

      // Calculate statistics
      const totalReminders = reminders.length;
      const completedReminders = reminders.filter(
        (r) => r.status === 'sent',
      ).length;
      const adherenceRate =
        totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

      const msg = {
        to: user.email!,
        from:
          this.configService.get<string>('EMAIL_FROM') || 'noreply@medcare.com',
        subject: 'Reporte Semanal de Adherencia',
        text: `Hola ${user.name},\n\nTu reporte semanal de adherencia a medicamentos:\n\nTotal de recordatorios: ${totalReminders}\nRecordatorios completados: ${completedReminders}\nTasa de adherencia: ${adherenceRate.toFixed(1)}%\n\nSaludos,\nTu equipo de MedCare`,
        html: `
          <h2>Reporte Semanal de Adherencia</h2>
          <p>Hola ${user.name},</p>
          <p>Tu reporte semanal de adherencia a medicamentos:</p>
          <ul>
            <li><strong>Total de recordatorios:</strong> ${totalReminders}</li>
            <li><strong>Recordatorios completados:</strong> ${completedReminders}</li>
            <li><strong>Tasa de adherencia:</strong> ${adherenceRate.toFixed(1)}%</li>
          </ul>
          <p>Saludos,<br>Tu equipo de MedCare</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Weekly report sent to ${user.email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending weekly report:', error);
      throw error;
    }
  }
}
