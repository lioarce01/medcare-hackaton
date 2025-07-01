-- Update subscription_features default value and existing data
-- Migration: Update subscription features to comprehensive structure

-- Update existing users with old subscription_features structure
UPDATE public.users 
SET subscription_features = jsonb_build_object(
  'medications', true,
  'basic_reminders', true,
  'adherence_tracking', true,
  'advanced_analytics', COALESCE(subscription_features->>'advanced_analytics', 'false')::boolean,
  'data_export', COALESCE(subscription_features->>'data_export', 'false')::boolean,
  'custom_reminders', COALESCE(subscription_features->>'custom_reminders', 'false')::boolean,
  'unlimited_medications', false,
  'risk_predictions', COALESCE(subscription_features->>'risk_predictions', 'false')::boolean,
  'weekly_reports', false,
  'maxMedications', 3,
  'maxReminders', 10,
  'maxFamilyMembers', 0
)
WHERE subscription_features IS NULL 
   OR NOT (subscription_features ? 'medications' AND subscription_features ? 'maxMedications');

-- Update premium users to have unlimited medications and reminders
UPDATE public.users 
SET subscription_features = jsonb_set(
  subscription_features,
  '{unlimited_medications, maxMedications, maxReminders}',
  '[true, -1, -1]'::jsonb
)
WHERE subscription_status = 'premium' AND subscription_plan = 'premium'; 