/*
  # Fix user registration constraints

  1. Changes
    - Make `name` column nullable to allow registration without immediate profile completion
    - Make `password` column nullable since we're using Supabase auth
    - Add default values for required fields
    - Update column constraints to match auth flow

  2. Security
    - Maintains existing RLS policies
    - No changes to security configuration needed
*/

-- Make name and password nullable since they're handled by auth.users
ALTER TABLE public.users 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN password DROP NOT NULL;

-- Set default values for required fields to prevent registration failures
ALTER TABLE public.users
  ALTER COLUMN email_notifications_enabled SET DEFAULT true,
  ALTER COLUMN preferred_reminder_time SET DEFAULT ARRAY['08:00', '12:00', '18:00']::text[],
  ALTER COLUMN is_admin SET DEFAULT false;