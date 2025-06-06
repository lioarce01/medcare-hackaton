import { supabaseAdmin } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token ? 'Token present' : 'No token');

      // Verify token using Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        console.error('Token verification failed:', error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }

      console.log('User authenticated:', { userId: user.id });

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch failed:', profileError);
        res.status(401);
        throw new Error('Not authorized, user profile not found');
      }

      console.log('User profile found:', { userId: profile.id });

      // Attach both user and profile to request
      req.user = {
        ...profile,
        authId: user.id
      };
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.error('No token provided');
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