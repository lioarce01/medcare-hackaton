/*
  # Fix user profile creation

  This migration adds a trigger to automatically create a user profile in public.users
  when a new user is created in auth.users.

  1. New Functions
    - Create function to handle user creation
  2. New Triggers
    - Add trigger on auth.users to create public.users profile
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, is_admin, email_notifications_enabled, preferred_reminder_time)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'isAdmin')::boolean, false),
    true,
    ARRAY['08:00', '12:00', '18:00']
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();