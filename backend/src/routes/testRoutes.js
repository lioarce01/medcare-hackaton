import { sendWeeklyReport } from '../services/emailService.js';
import express from 'express';

const router = express.Router();


router.get('/test-weekly-report', async (req, res) => {
  const testUser = { email: 'lioarce1@gmail.com', name: 'Test User', id: 'testid' };
  const testReportData = { adherence: '100%', details: 'All doses taken!' };
  try {
    const result = await sendWeeklyReport(testUser, testReportData);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router