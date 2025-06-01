/*
  # Add user registration RLS policy

  1. Security Changes
    - Add RLS policy to allow new users to insert their own profile data
    - Policy ensures users can only insert a row where their auth.uid matches the id column
    
  Note: This policy is essential for the registration flow to work properly
*/

-- Add policy to allow new users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);