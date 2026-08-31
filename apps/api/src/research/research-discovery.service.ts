import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { db } from '@insightiq/db'
import { AccountContextService, type AuthenticatedSession } from '../auth/account-context.service'
import { TavilySearchService } from '../tavily/tavily-search.service'
import { buildDiscoveryQueries, deduplicateDiscoveredSources } from './research-discovery'

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Source discovery failed'
  return message.slice(0, 1_000)
}

@Injectable()
export class ResearchDiscoveryService {
  constructor(
    private readonly accounts: AccountContextService,
    private readonly tavily: TavilySearchService,
  ) {}

  async discover(session: AuthenticatedSession, id: string) {
    const membership = await this.accounts.assertActiveWorkspace(session)
    const organizationId = membership.organizationId
    const run = await db.researchRun.findUnique({
      where: { id_organizationId: { id, organizationId } },
      include: { prospect: true },
    })
    if (!run) throw new NotFoundException('Research run not found')
    if (run.status !== 'queued') throw new ConflictException(`Research run cannot start discovery while ${run.status}`)

    const claimed = await db.researchRun.updateMany({
      where: { id, organizationId, status: 'queued' },
      data: { status: 'running', startedAt: new Date(), errorMessage: null },
    })
    if (claimed.count !== 1) throw new ConflictException('Research run has already been claimed')

    try {
      const queries = buildDiscoveryQueries(run.prospect)
      const settled = await Promise.allSettled(queries.map((item) => this.tavily.search({ ...item, sessionId: run.id })))
      const batches = settled.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
      const failedQueries = settled.length - batches.length
      if (!batches.length) {
        const failure = settled.find((result) => result.status === 'rejected')
        throw failure?.status === 'rejected' ? failure.reason : new Error('Source discovery failed')
      }

      const sources = deduplicateDiscoveredSources(batches)
      if (!sources.length) {
        throw new UnprocessableEntityException('No public sources were found for the supplied prospect identifiers')
      }

      await db.$transaction(sources.map((source) => db.evidenceSource.upsert({
        where: {
          researchRunId_organizationId_url: {
            researchRunId: run.id,
            organizationId,
            url: source.url,
          },
        },
        create: {
          organizationId,
          researchRunId: run.id,
          url: source.url,
          title: source.title,
          publisher: source.publisher,
          sourceType: 'tavily-search',
          publishedAt: source.publishedAt,
          excerpt: source.excerpt,
          metadata: { provider: 'tavily', matches: source.matches },
        },
        update: {
          title: source.title,
          publisher: source.publisher,
          sourceType: 'tavily-search',
          publishedAt: source.publishedAt,
          retrievedAt: new Date(),
          excerpt: source.excerpt,
          metadata: { provider: 'tavily', matches: source.matches },
        },
      })))

      return {
        researchRunId: run.id,
        status: 'running',
        sourcesCollected: sources.length,
        queriesCompleted: batches.length,
        failedQueries,
      }
    } catch (error) {
      await db.researchRun.updateMany({
        where: { id: run.id, organizationId, status: 'running' },
        data: { status: 'failed', errorMessage: safeErrorMessage(error) },
      })
      throw error
    }
  }
}
