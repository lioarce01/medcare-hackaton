/*
  # Add subscription fields to users table

  1. Changes
    - Add subscription status and plan fields
    - Add subscription expiration date
    - Add subscription features as a JSONB object
    - Set default values for free tier users

  2. Security
    - Maintains existing RLS policies
    - No changes to security configuration needed
*/

-- Add subscription fields to users table
ALTER TABLE public.users
  ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('free', 'premium')) DEFAULT 'free',
  ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('free', 'premium')) DEFAULT 'free',
  ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN subscription_features JSONB DEFAULT '{
    "smsReminders": false,
    "customSounds": false,
    "priorityNotifications": false,
    "familyNotifications": false
  }'::jsonb;

-- Update existing users to have free tier features
UPDATE public.users
SET subscription_status = 'free',
    subscription_plan = 'free',
    subscription_features = '{
      "smsReminders": false,
      "customSounds": false,
      "priorityNotifications": false,
      "familyNotifications": false
    }'::jsonb
WHERE subscription_status IS NULL; 