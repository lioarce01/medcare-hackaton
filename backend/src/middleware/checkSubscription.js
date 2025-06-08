import { supabaseAdmin } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Obtener el estado de la suscripción del usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('subscription_status, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error checking subscription:', error);
      return res.status(500).json({ error: 'Error checking subscription status' });
    }

    // Verificar si el usuario tiene una suscripción premium activa
    const isPremium = user.subscription_status === 'premium' && 
                     new Date(user.subscription_expires_at) > new Date();

    if (!isPremium) {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        message: 'This feature is only available for premium users'
      });
    }

    // Si el usuario es premium, continuar con la siguiente función
    next();
  } catch (error) {
    logger.error('Error in checkSubscription middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 