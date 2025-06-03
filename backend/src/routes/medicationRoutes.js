import express from 'express';
import {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  getActiveMedications,
} from '../controllers/medicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMedications)
  .post(protect, createMedication);

router.route('/active')
  .get(protect, getActiveMedications);

router.route('/:id')
  .get(protect, getMedicationById)
  .put(protect, updateMedication)
  .delete(protect, deleteMedication);

export default router;