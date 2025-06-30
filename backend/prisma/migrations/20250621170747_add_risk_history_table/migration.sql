-- CreateTable
CREATE TABLE "public"."risk_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_risk_history_user_id" ON "public"."risk_history"("user_id");

-- CreateIndex
CREATE INDEX "idx_risk_history_medication_id" ON "public"."risk_history"("medication_id");
