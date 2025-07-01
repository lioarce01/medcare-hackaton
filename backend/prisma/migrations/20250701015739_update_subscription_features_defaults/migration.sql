-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "subscription_features" SET DEFAULT '{"medications": true, "basic_reminders": true, "adherence_tracking": true, "advanced_analytics": false, "data_export": false, "custom_reminders": false, "unlimited_medications": false, "risk_predictions": false, "weekly_reports": false, "maxMedications": 3, "maxReminders": 10, "maxFamilyMembers": 0}';
