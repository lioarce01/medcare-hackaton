import { supabaseAdmin } from '../config/db.js'; // asegúrate que este path sea correcto
import { logger } from '../utils/logger.js';

/**
 * Calcula y guarda el risk_score para cada combinación usuario/medicación
 * basado en adherencia de los últimos 7 días.
 */
export async function calculateAndStoreDailyRiskScores() {
  const { data: users, error: usersError } = await supabaseAdmin.from('users').select('id, subscription_status');

  if (usersError) {
    logger.error('❌ Error fetching users:', usersError);
    return;
  }

  for (const user of users) {
    if (user.subscription_status !== 'premium') continue;

    const { data: medications, error: medsError } = await supabaseAdmin
      .from('medications')
      .select('id')
      .eq('user_id', user.id);

    if (medsError) {
      logger.error(`❌ Error fetching medications for user ${user.id}:`, medsError);
      continue;
    }

    for (const med of medications) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const { data: adherenceData, error: adherenceError } = await supabaseAdmin
        .from('adherence')
        .select('id')
        .eq('user_id', user.id)
        .eq('medication_id', med.id)
        .gte('taken_time', sevenDaysAgo.toISOString());

      if (adherenceError) {
        logger.error(`❌ Error fetching adherence for user ${user.id}, med ${med.id}`, adherenceError);
        continue;
      }

      const expectedDoses = 14;
      const takenDoses = adherenceData?.length ?? 0;
      const riskScore = Math.min(1, Math.max(0, 1 - takenDoses / expectedDoses));

      const { error: insertError } = await supabaseAdmin.from('risk_history').insert({
        user_id: user.id,
        medication_id: med.id,
        date: now.toISOString().split('T')[0],
        risk_score: riskScore
      });

      if (insertError) {
        logger.error(`❌ Error inserting risk_score for user ${user.id}, med ${med.id}`, insertError);
      } else {
        logger.info(`✅ Risk score registrado: user ${user.id}, med ${med.id}, score ${riskScore.toFixed(2)}`);
      }
    }
  }
}

export async function getRiskHistoryByUserAndMedication(userId, medicationId) {
  const { data, error } = await supabaseAdmin
    .from('risk_history')
    .select('id, created_at, risk_score')
    .eq('user_id', userId)
    .eq('medication_id', medicationId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}   
