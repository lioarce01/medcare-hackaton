import { supabaseAdmin } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        res.status(401);
        throw new Error('Not authorized, user profile not found');
      }

      req.user = profile;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req, res, next) => {
  if (req.user?.is_admin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};