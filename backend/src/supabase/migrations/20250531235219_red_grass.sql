/*
  # Fix user registration by adding registration-specific RLS policy

  1. Changes
    - Add a new RLS policy specifically for user registration
    - This policy allows new users to insert their profile during registration
    - The policy ensures users can only insert their own profile (id must match auth.uid())
    
  2. Security
    - Policy is restricted to INSERT operations only
    - Enforces user can only create their own profile
    - Maintains existing security policies
*/

-- Drop the existing policy if it conflicts
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Enable registration'
    ) THEN
        DROP POLICY "Enable registration" ON public.users;
    END IF;
END $$;

-- Create new policy specifically for registration
CREATE POLICY "Enable registration" ON public.users
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = id);