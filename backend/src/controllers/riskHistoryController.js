import { supabaseAdmin } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { getRiskHistoryByUserAndMedication } from '../services/riskScoreService.js';

export async function getRiskHistoryHandler(req, res) {
  const userId = req.user?.id; // ← Esto debe venir del middleware auth
  const { medication_id } = req.query;

  if (!userId || !medication_id) {
    return res.status(400).json({ error: 'Missing userId or medication_id' });
  }

  // ✅ Verificamos si el usuario es premium
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    logger.error(`❌ Error checking premium status for user ${userId}:`, userError);
    return res.status(500).json({ error: 'Error verifying user' });
  }

  if (user.subscription_status !== 'premium') {
    return res.status(403).json({ error: 'Access denied: Premium membership required.' });
  }

  try {
    const history = await getRiskHistoryByUserAndMedication(userId, medication_id);
    return res.status(200).json(history);
  } catch (err) {
    logger.error('❌ Error getting risk history:', err);
    return res.status(500).json({ error: 'Failed to retrieve risk history' });
  }
}
