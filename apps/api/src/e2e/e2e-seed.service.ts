import { Injectable, NotFoundException } from '@nestjs/common'
import { db } from '@insightiq/db'
import { hashPassword } from 'better-auth/crypto'
import { randomBytes } from 'node:crypto'

const E2E_EMAIL = 'e2e@insightiq.test'
const E2E_PASSWORD = 'E2eTestPass1!'
const SOURCE_URL = 'https://en.wikipedia.org/wiki/Tim_Cook'

function createId() {
  return randomBytes(12).toString('hex')
}

@Injectable()
export class E2eSeedService {
  async seed() {
    await db.user.deleteMany({ where: { email: E2E_EMAIL } })

    const userId = createId()
    const organizationId = createId()
    const memberId = createId()
    const accountId = createId()
    const sessionId = createId()
    const sessionToken = randomBytes(32).toString('hex')
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const passwordHash = await hashPassword(E2E_PASSWORD)

    const prospect = {
      name: 'Tim Cook',
      email: null as string | null,
      companyName: 'Apple',
      companyDomain: 'apple.com',
      linkedinUrl: null as string | null,
      xHandle: null as string | null,
    }
    const offer = {
      name: 'InsightIQ Platform',
      valueProposition: 'Evidence-backed deal briefs for every prospect conversation.',
      targetPersona: 'Revenue leaders',
    }

    const result = await db.$transaction(async (transaction) => {
      await transaction.user.create({
        data: {
          id: userId,
          name: 'E2E Tester',
          email: E2E_EMAIL,
          emailVerified: true,
          twoFactorEnabled: false,
        },
      })
      await transaction.account.create({
        data: {
          id: accountId,
          issuer: 'InsightIQ',
          accountId: E2E_EMAIL,
          providerId: 'credential',
          userId,
          password: passwordHash,
        },
      })
      await transaction.organization.create({
        data: {
          id: organizationId,
          name: 'E2E Workspace',
          slug: `e2e-${createId()}`,
          createdAt: now,
        },
      })
      await transaction.member.create({
        data: {
          id: memberId,
          organizationId,
          userId,
          role: 'owner',
          createdAt: now,
        },
      })
      await transaction.session.create({
        data: {
          id: sessionId,
          token: sessionToken,
          userId,
          activeOrganizationId: organizationId,
          expiresAt,
        },
      })

      const createdProspect = await transaction.prospect.create({
        data: { organizationId, createdById: userId, ...prospect },
      })
      const createdOffer = await transaction.offer.create({
        data: { organizationId, createdById: userId, ...offer },
      })
      const run = await transaction.researchRun.create({
        data: {
          organizationId,
          createdById: userId,
          prospectId: createdProspect.id,
          offerId: createdOffer.id,
          goal: 'meeting',
          status: 'completed',
          requestedAt: now,
          startedAt: now,
          completedAt: now,
          inputSnapshot: { prospect, offer, goal: 'meeting' },
        },
      })
      const source = await transaction.evidenceSource.create({
        data: {
          organizationId,
          researchRunId: run.id,
          url: SOURCE_URL,
          title: 'Tim Cook - Wikipedia',
          publisher: 'Wikipedia',
          sourceType: 'profile',
          excerpt: 'Timothy Donald Cook is the chief executive officer of Apple Inc.',
        },
      })
      const evidence = await transaction.evidence.create({
        data: {
          organizationId,
          researchRunId: run.id,
          sourceId: source.id,
          claim: 'Timothy Donald Cook is the chief executive officer of Apple Inc.',
          signalType: 'leadership',
          confidence: 0.92,
        },
      })
      const brief = await transaction.dealBrief.create({
        data: {
          organizationId,
          researchRunId: run.id,
          title: 'Deal brief · Tim Cook',
          status: 'ready',
          sections: {
            summary: 'Tim Cook at Apple: cited leadership signal for meeting prep.',
            talking_points: [evidence.claim],
          },
        },
      })
      await transaction.notification.create({
        data: {
          organizationId,
          userId,
          researchRunId: run.id,
          type: 'brief-ready',
          title: 'Brief ready for Tim Cook',
          body: '1 cited claim(s) are ready to review.',
        },
      })

      return {
        email: E2E_EMAIL,
        password: E2E_PASSWORD,
        sessionToken,
        cookieName: 'insightiq.session_token',
        runId: run.id,
        briefId: brief.id,
        prospectName: prospect.name,
        citationUrl: SOURCE_URL,
      }
    })

    return result
  }

  assertEnabled() {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException()
    if (process.env.E2E_ENABLED !== 'true') throw new NotFoundException()
    const secret = process.env.E2E_SEED_SECRET?.trim()
    if (!secret || secret.length < 16) throw new NotFoundException()
    return secret
  }
}
