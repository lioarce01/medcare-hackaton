import express from 'express';
import {
  getUpcomingReminders,
  getAllReminders,
  sendReminderManually,
  updateReminderSettings,
  createReminder,
  deleteReminder,
  getUserSettings
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkSubscription } from '../middleware/checkSubscription.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rutas que requieren autenticación
router.route('/')
  .get(protect, getAllReminders)
  .post(protect, checkSubscription, createReminder);

// Rutas que requieren autenticación y suscripción premium
router.route('/upcoming')
  .get(protect, checkSubscription, getUpcomingReminders);

router.route('/:id/send')
  .post(protect, checkSubscription, sendReminderManually);

router.route('/:id')
  .delete(protect, deleteReminder);

router.route('/settings')
  .get(protect, getUserSettings)
  .put(protect, checkSubscription, updateReminderSettings);

// Ruta para crear un recordatorio (requiere suscripción premium)
router.post('/', checkSubscription, async (req, res) => {
  try {
    const { medicationId, scheduledTime, scheduledDate, message } = req.body;
    const userId = req.user.id;

    const reminder = await createReminder(
      userId,
      medicationId,
      scheduledTime,
      scheduledDate,
      message
    );

    res.status(201).json(reminder);
  } catch (error) {
    logger.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Error creating reminder' });
  }
});

// Ruta para obtener recordatorios futuros (requiere suscripción premium)
router.get('/upcoming', checkSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await getUpcomingReminders(userId);
    res.json(reminders);
  } catch (error) {
    logger.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ error: 'Error fetching upcoming reminders' });
  }
});

export default router;