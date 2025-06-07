import sgMail from '@sendgrid/mail';
import { supabaseAdmin } from '../config/db.js';
import { logger } from '../utils/logger.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMedicationReminder = async (reminder) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', reminder.user_id)
      .single();

    if (userError) {
      logger.error('Error fetching user:', userError);
      throw new Error('User not found');
    }

    // Formatear la dosis correctamente
    const dosage = typeof reminder.medications.dosage === 'object' 
      ? `${reminder.medications.dosage.amount} ${reminder.medications.dosage.unit}`
      : reminder.medications.dosage;

    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Recordatorio de Medicamento',
      text: `Hola ${user.name},\n\nEs hora de tomar tu medicamento:\n\nMedicamento: ${reminder.medications.name}\nDosis: ${dosage}\nInstrucciones: ${reminder.medications.instructions}\n\nSaludos,\nTu equipo de MedCare`,
      html: `
        <h2>Recordatorio de Medicamento</h2>
        <p>Hola ${user.name},</p>
        <p>Es hora de tomar tu medicamento:</p>
        <ul>
          <li><strong>Medicamento:</strong> ${reminder.medications.name}</li>
          <li><strong>Dosis:</strong> ${dosage}</li>
          <li><strong>Instrucciones:</strong> ${reminder.medications.instructions}</li>
        </ul>
        <p>Saludos,<br>Tu equipo de MedCare</p>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Email reminder sent to ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error sending email reminder:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
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
    logger.info(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendSubscriptionConfirmation = async (email, name, plan) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
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
    logger.info(`Subscription confirmation sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription confirmation:', error);
    throw error;
  }
};

export const sendWeeklyReport = async (userId) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError) {
      logger.error('Error fetching user:', userError);
      throw new Error('User not found');
    }

    // Obtener recordatorios de la última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: reminders, error: remindersError } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        scheduled_time,
        scheduled_date,
        status,
        medications (
          name,
          dosage
        )
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', oneWeekAgo.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (remindersError) {
      logger.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    // Calcular estadísticas
    const totalReminders = reminders.length;
    const completedReminders = reminders.filter(r => r.status === 'sent').length;
    const adherenceRate = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
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
    logger.info(`Weekly report sent to ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error sending weekly report:', error);
    throw error;
  }
};