-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "date_of_birth" SET DATA TYPE TEXT,
ALTER COLUMN "subscription_status" SET DEFAULT 'free',
ALTER COLUMN "subscription_plan" SET DEFAULT 'free',
ALTER COLUMN "subscription_features" SET DEFAULT '{"data_export": false, "basic_reminders": true, "custom_reminders": false, "risk_predictions": false, "advanced_analytics": false, "medication_tracking": true}';
