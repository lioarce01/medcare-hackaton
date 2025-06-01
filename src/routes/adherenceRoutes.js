import express from 'express';
import {
  confirmMedicationTaken,
  skipMedication,
  getTodayAdherence,
  getAdherenceHistory,
  getAdherenceStats,
  createAdherence
} from '../controllers/adherenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createAdherence);

router.route('/confirm')
  .post(protect, confirmMedicationTaken);

router.route('/skip')
  .post(protect, skipMedication);

router.route('/today')
  .get(protect, getTodayAdherence);

router.route('/history')
  .get(protect, getAdherenceHistory);

router.route('/stats')
  .get(protect, getAdherenceStats);

export default router;