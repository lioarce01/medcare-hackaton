import express from 'express';
import {
  getAdherenceStats,
  getAdherenceTimeline,
  getRiskPredictions,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/adherence')
  .get(protect, getAdherenceStats);

router.route('/timeline')
  .get(protect, getAdherenceTimeline);

router.route('/risks')
  .get(protect, getRiskPredictions);

export default router;