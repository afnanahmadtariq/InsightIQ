CREATE TABLE "brief_share" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dealBriefId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "brief_share_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "brief_share_token_key" ON "brief_share"("token");
CREATE UNIQUE INDEX "brief_share_dealBriefId_key" ON "brief_share"("dealBriefId");
CREATE INDEX "brief_share_organizationId_createdAt_idx" ON "brief_share"("organizationId", "createdAt");
CREATE INDEX "brief_share_createdById_idx" ON "brief_share"("createdById");

ALTER TABLE "brief_share" ADD CONSTRAINT "brief_share_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_share" ADD CONSTRAINT "brief_share_dealBriefId_fkey" FOREIGN KEY ("dealBriefId") REFERENCES "deal_brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_share" ADD CONSTRAINT "brief_share_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
