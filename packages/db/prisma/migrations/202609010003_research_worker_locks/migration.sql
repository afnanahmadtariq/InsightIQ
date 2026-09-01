ALTER TABLE "research_run" ADD COLUMN "lockedAt" TIMESTAMP(3);
ALTER TABLE "research_run" ADD COLUMN "lockExpiresAt" TIMESTAMP(3);
ALTER TABLE "research_run" ADD COLUMN "workerId" TEXT;
ALTER TABLE "research_run" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "research_run_status_lockExpiresAt_requestedAt_idx" ON "research_run"("status", "lockExpiresAt", "requestedAt");
