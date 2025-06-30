-- Migration: Add default notification preferences
-- This migration ensures all user_settings have proper notification preferences

-- First, update existing records that have null or incomplete notification_preferences
UPDATE public.user_settings 
SET 
  notification_preferences = '{"email": true, "sms": false, "push": false, "reminder_before": 15}'::jsonb,
  preferred_times = ARRAY['08:00', '14:00', '20:00'],
  updated_at = now()
WHERE 
  notification_preferences IS NULL 
  OR notification_preferences = '{}'::jsonb
  OR notification_preferences = 'null'::jsonb
  OR (notification_preferences->>'email') IS NULL
  OR (notification_preferences->>'sms') IS NULL
  OR (notification_preferences->>'push') IS NULL
  OR (notification_preferences->>'reminder_before') IS NULL;

-- Also ensure all user_settings have preferred_times
UPDATE public.user_settings 
SET 
  preferred_times = ARRAY['08:00', '14:00', '20:00'],
  updated_at = now()
WHERE 
  preferred_times IS NULL 
  OR array_length(preferred_times, 1) = 0;

-- Add a comment to document the expected structure
COMMENT ON COLUMN public.user_settings.notification_preferences IS 'JSON object with structure: {"email": boolean, "sms": boolean, "push": boolean, "reminder_before": number}'; 