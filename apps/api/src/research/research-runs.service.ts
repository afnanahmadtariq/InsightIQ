import { Injectable, NotFoundException } from '@nestjs/common'
import { db } from '@insightiq/db'
import { AccountContextService, type AuthenticatedSession } from '../auth/account-context.service'
import type { CreateResearchRunDto } from './dto/create-research-run.dto'

@Injectable()
export class ResearchRunsService {
  constructor(private readonly accounts: AccountContextService) {}

  async create(session: AuthenticatedSession, input: CreateResearchRunDto) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const organizationId = membership.organizationId

    return db.$transaction(async (transaction) => {
      const prospect = await transaction.prospect.create({
        data: {
          organizationId,
          createdById: session.user.id,
          name: input.prospectName,
          email: input.prospectEmail,
          companyName: input.companyName,
          companyDomain: input.companyDomain,
          linkedinUrl: input.linkedinUrl,
          xHandle: input.xHandle,
        },
      })
      const offer = await transaction.offer.create({
        data: {
          organizationId,
          createdById: session.user.id,
          name: input.offerName,
          valueProposition: input.offerContext,
          targetPersona: input.targetPersona,
        },
      })
      return transaction.researchRun.create({
        data: {
          organizationId,
          createdById: session.user.id,
          prospectId: prospect.id,
          offerId: offer.id,
          goal: input.goal,
          inputSnapshot: {
            prospect: {
              name: prospect.name,
              email: prospect.email,
              companyName: prospect.companyName,
              companyDomain: prospect.companyDomain,
              linkedinUrl: prospect.linkedinUrl,
              xHandle: prospect.xHandle,
            },
            offer: {
              name: offer.name,
              valueProposition: offer.valueProposition,
              targetPersona: offer.targetPersona,
            },
            goal: input.goal,
          },
        },
        include: { prospect: true, offer: true },
      })
    })
  }

  async list(session: AuthenticatedSession) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    return db.researchRun.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        prospect: true,
        offer: true,
        _count: { select: { evidence: true, sources: true } },
        brief: { select: { id: true, title: true, status: true, updatedAt: true } },
      },
      orderBy: { requestedAt: 'desc' },
      take: 100,
    })
  }

  async get(session: AuthenticatedSession, id: string) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const run = await db.researchRun.findUnique({
      where: { id_organizationId: { id, organizationId: membership.organizationId } },
      include: {
        prospect: true,
        offer: true,
        sources: { orderBy: { retrievedAt: 'desc' } },
        evidence: { include: { source: true }, orderBy: { createdAt: 'asc' } },
        brief: true,
      },
    })
    if (!run) throw new NotFoundException('Research run not found')
    return run
  }
}
