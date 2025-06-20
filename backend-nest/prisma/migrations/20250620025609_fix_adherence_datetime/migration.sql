-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "name" TEXT,
    "password" TEXT,
    "date_of_birth" TIMESTAMP(6),
    "gender" TEXT,
    "allergies" TEXT[],
    "conditions" TEXT[],
    "is_admin" BOOLEAN DEFAULT false,
    "phone_number" TEXT,
    "emergency_contact" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "subscription_status" TEXT,
    "subscription_plan" TEXT,
    "subscription_expires_at" TIMESTAMP(6),
    "subscription_features" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "email_enabled" BOOLEAN NOT NULL,
    "preferred_times" TEXT[],
    "timezone" TEXT NOT NULL,
    "notification_preferences" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" JSON NOT NULL,
    "frequency" JSON NOT NULL,
    "scheduled_times" TEXT[],
    "instructions" TEXT,
    "start_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ(6),
    "refill_reminder" JSON,
    "side_effects_to_watch" TEXT[],
    "active" BOOLEAN DEFAULT true,
    "medication_type" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."adherence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "taken_time" TIMESTAMPTZ(6),
    "status" TEXT DEFAULT 'pending',
    "notes" TEXT,
    "reminder_sent" BOOLEAN DEFAULT false,
    "side_effects_reported" TEXT[],
    "dosage_taken" JSON,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adherence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "channels" JSON DEFAULT '{"email": {"enabled": true, "sent": false}, "sms": {"enabled": false, "sent": false}}',
    "message" TEXT,
    "retry_count" INTEGER DEFAULT 0,
    "last_retry" TIMESTAMPTZ(6),
    "adherence_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "public"."user_settings"("user_id");

-- CreateIndex
CREATE INDEX "idx_medications_user_id" ON "public"."medications"("user_id");

-- CreateIndex
CREATE INDEX "idx_adherence_medication_id" ON "public"."adherence"("medication_id");

-- CreateIndex
CREATE INDEX "idx_adherence_user_id" ON "public"."adherence"("user_id");

-- CreateIndex
CREATE INDEX "idx_reminders_adherence_id" ON "public"."reminders"("adherence_id");

-- CreateIndex
CREATE INDEX "idx_reminders_medication_id" ON "public"."reminders"("medication_id");

-- CreateIndex
CREATE INDEX "idx_reminders_user_id" ON "public"."reminders"("user_id");

-- AddForeignKey
ALTER TABLE "public"."user_settings" ADD CONSTRAINT "fk_user_settings_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."medications" ADD CONSTRAINT "fk_medications_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."adherence" ADD CONSTRAINT "fk_adherence_medication" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."adherence" ADD CONSTRAINT "fk_adherence_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "fk_reminders_adherence" FOREIGN KEY ("adherence_id") REFERENCES "public"."adherence"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "fk_reminders_medication" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "fk_reminders_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
