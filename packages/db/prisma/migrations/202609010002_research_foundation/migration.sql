CREATE TABLE "prospect" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "companyName" TEXT,
    "companyDomain" TEXT,
    "linkedinUrl" TEXT,
    "xHandle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prospect_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "targetPersona" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "research_run" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdById" TEXT,
    "goal" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "inputSnapshot" JSONB NOT NULL,
    CONSTRAINT "research_run_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "evidence_source" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "sourceType" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "excerpt" TEXT,
    "metadata" JSONB,
    CONSTRAINT "evidence_source_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "observedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "deal_brief" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sections" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "deal_brief_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "researchRunId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "prospect_id_organizationId_key" ON "prospect"("id", "organizationId");
CREATE INDEX "prospect_organizationId_updatedAt_idx" ON "prospect"("organizationId", "updatedAt");
CREATE INDEX "prospect_createdById_idx" ON "prospect"("createdById");
CREATE UNIQUE INDEX "offer_id_organizationId_key" ON "offer"("id", "organizationId");
CREATE INDEX "offer_organizationId_updatedAt_idx" ON "offer"("organizationId", "updatedAt");
CREATE INDEX "offer_createdById_idx" ON "offer"("createdById");
CREATE UNIQUE INDEX "research_run_id_organizationId_key" ON "research_run"("id", "organizationId");
CREATE INDEX "research_run_organizationId_status_requestedAt_idx" ON "research_run"("organizationId", "status", "requestedAt");
CREATE INDEX "research_run_prospectId_organizationId_idx" ON "research_run"("prospectId", "organizationId");
CREATE INDEX "research_run_offerId_organizationId_idx" ON "research_run"("offerId", "organizationId");
CREATE INDEX "research_run_createdById_idx" ON "research_run"("createdById");
CREATE UNIQUE INDEX "evidence_source_id_organizationId_key" ON "evidence_source"("id", "organizationId");
CREATE UNIQUE INDEX "evidence_source_researchRunId_organizationId_url_key" ON "evidence_source"("researchRunId", "organizationId", "url");
CREATE INDEX "evidence_source_organizationId_retrievedAt_idx" ON "evidence_source"("organizationId", "retrievedAt");
CREATE UNIQUE INDEX "evidence_id_organizationId_key" ON "evidence"("id", "organizationId");
CREATE INDEX "evidence_researchRunId_organizationId_createdAt_idx" ON "evidence"("researchRunId", "organizationId", "createdAt");
CREATE INDEX "evidence_sourceId_organizationId_idx" ON "evidence"("sourceId", "organizationId");
CREATE UNIQUE INDEX "deal_brief_researchRunId_organizationId_key" ON "deal_brief"("researchRunId", "organizationId");
CREATE INDEX "deal_brief_organizationId_updatedAt_idx" ON "deal_brief"("organizationId", "updatedAt");
CREATE INDEX "notification_userId_readAt_createdAt_idx" ON "notification"("userId", "readAt", "createdAt");
CREATE INDEX "notification_organizationId_createdAt_idx" ON "notification"("organizationId", "createdAt");
CREATE INDEX "notification_researchRunId_organizationId_idx" ON "notification"("researchRunId", "organizationId");
ALTER TABLE "prospect" ADD CONSTRAINT "prospect_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prospect" ADD CONSTRAINT "prospect_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offer" ADD CONSTRAINT "offer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offer" ADD CONSTRAINT "offer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "research_run" ADD CONSTRAINT "research_run_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_run" ADD CONSTRAINT "research_run_prospectId_organizationId_fkey" FOREIGN KEY ("prospectId", "organizationId") REFERENCES "prospect"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_run" ADD CONSTRAINT "research_run_offerId_organizationId_fkey" FOREIGN KEY ("offerId", "organizationId") REFERENCES "offer"("id", "organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "research_run" ADD CONSTRAINT "research_run_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence_source" ADD CONSTRAINT "evidence_source_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence_source" ADD CONSTRAINT "evidence_source_researchRunId_organizationId_fkey" FOREIGN KEY ("researchRunId", "organizationId") REFERENCES "research_run"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_researchRunId_organizationId_fkey" FOREIGN KEY ("researchRunId", "organizationId") REFERENCES "research_run"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_sourceId_organizationId_fkey" FOREIGN KEY ("sourceId", "organizationId") REFERENCES "evidence_source"("id", "organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deal_brief" ADD CONSTRAINT "deal_brief_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deal_brief" ADD CONSTRAINT "deal_brief_researchRunId_organizationId_fkey" FOREIGN KEY ("researchRunId", "organizationId") REFERENCES "research_run"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification" ADD CONSTRAINT "notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification" ADD CONSTRAINT "notification_researchRunId_organizationId_fkey" FOREIGN KEY ("researchRunId", "organizationId") REFERENCES "research_run"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
