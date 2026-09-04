import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { db } from '@insightiq/db'
import { AccountContextService, type AuthenticatedSession } from '../auth/account-context.service'

@Injectable()
export class ResearchLibraryService {
  constructor(
    private readonly accounts: AccountContextService,
    private readonly config: ConfigService,
  ) {}

  async evidence(session: AuthenticatedSession) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const organizationId = membership.organizationId
    const [sources, evidence] = await Promise.all([
      db.evidenceSource.findMany({
        where: { organizationId },
        include: {
          researchRun: {
            select: {
              id: true,
              goal: true,
              prospect: { select: { name: true, companyName: true } },
              offer: { select: { name: true } },
            },
          },
          _count: { select: { evidence: true } },
        },
        orderBy: { retrievedAt: 'desc' },
        take: 200,
      }),
      db.evidence.findMany({
        where: { organizationId },
        include: {
          source: { select: { title: true, url: true, publisher: true } },
          researchRun: {
            select: {
              id: true,
              prospect: { select: { name: true, companyName: true } },
              offer: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ])
    return { sources, evidence }
  }

  async briefs(session: AuthenticatedSession) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    return db.dealBrief.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        researchRun: {
          select: {
            id: true,
            goal: true,
            prospect: { select: { name: true, companyName: true } },
            offer: { select: { name: true } },
            _count: { select: { evidence: true, sources: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })
  }

  async brief(session: AuthenticatedSession, id: string) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const brief = await db.dealBrief.findFirst({
      where: { id, organizationId: membership.organizationId },
      include: {
        researchRun: {
          include: {
            prospect: true,
            offer: true,
            evidence: { include: { source: true }, orderBy: { createdAt: 'asc' } },
          },
        },
      },
    })
    if (!brief) throw new NotFoundException('Deal brief not found')
    return brief
  }

  async notifications(session: AuthenticatedSession) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    return db.notification.findMany({
      where: { organizationId: membership.organizationId, userId: session.user.id },
      include: {
        researchRun: { select: { id: true, prospect: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async markNotificationRead(session: AuthenticatedSession, id: string) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const result = await db.notification.updateMany({
      where: {
        id,
        organizationId: membership.organizationId,
        userId: session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    })
    if (result.count !== 1) throw new NotFoundException('Unread notification not found')
    return { id, read: true }
  }

  async capabilities(session: AuthenticatedSession) {
    await this.accounts.assertActiveWorkspace(session)
    const configured = Boolean(this.config.get<string>('TAVILY_API_KEY'))
    return {
      webDiscovery: {
        provider: 'Tavily',
        status: configured ? 'configured' : 'keyless',
        searchDepth: this.config.get<string>('TAVILY_SEARCH_DEPTH') ?? 'advanced',
        maxResults: this.config.get<number>('TAVILY_MAX_RESULTS') ?? 6,
      },
      stages: [
        { id: 'intake', label: 'Prospect and offer intake', status: 'ready' },
        { id: 'source-discovery', label: 'Public source discovery', status: 'ready' },
        { id: 'evidence-normalization', label: 'Evidence normalization', status: 'ready' },
        { id: 'brief-synthesis', label: 'Conversation brief synthesis', status: 'ready' },
        { id: 'notification-delivery', label: 'Completion notifications', status: 'ready' },
      ],
    }
  }
}
