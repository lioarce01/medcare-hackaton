/*
  # Fix users table RLS policies

  1. Security Changes
    - Drop existing RLS policies on users table
    - Add new policies that properly handle:
      - User registration (INSERT)
      - User profile management (SELECT, UPDATE)
      - Profile deletion (DELETE)
    
  2. Changes
    - Ensures new users can create their profile during registration
    - Maintains security by limiting users to managing only their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can manage their own data" ON public.users;

-- Create new policies
CREATE POLICY "Enable insert for authentication" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users" ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);