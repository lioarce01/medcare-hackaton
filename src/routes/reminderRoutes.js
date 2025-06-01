import express from 'express';
import {
  getUpcomingReminders,
  getAllReminders,
  sendReminderManually,
  updateReminderSettings,
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllReminders);

router.route('/upcoming')
  .get(protect, getUpcomingReminders);

router.route('/:id/send')
  .post(protect, sendReminderManually);

router.route('/settings')
  .put(protect, updateReminderSettings);

export default router;