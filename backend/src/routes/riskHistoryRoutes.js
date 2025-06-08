import express from 'express';
import { getRiskHistoryHandler } from '../controllers/riskHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkSubscription } from '../middleware/checkSubscription.js';

const router = express.Router();

router.get('/', protect, checkSubscription, getRiskHistoryHandler);

export default router;
