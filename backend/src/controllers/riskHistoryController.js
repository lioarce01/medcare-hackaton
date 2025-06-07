import { getRiskHistoryByUserAndMedication } from '../services/riskScoreService.js';

export const getRiskHistoryHandler = async (req, res) => {
  const userId = req.user?.id;
  const medicationId = req.query.medication_id

  if (!medicationId) {
    return res.status(400).json({ error: 'Missing medication_id' });
  }

  try {
    const history = await getRiskHistoryByUserAndMedication(userId, medicationId);
    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching risk history:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
