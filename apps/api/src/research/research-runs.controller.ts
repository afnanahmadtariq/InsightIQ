import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Session } from '@thallesp/nestjs-better-auth'
import type { AuthenticatedSession } from '../auth/account-context.service'
import { CreateResearchRunDto } from './dto/create-research-run.dto'
import { ResearchDiscoveryService } from './research-discovery.service'
import { ResearchRunsService } from './research-runs.service'

@Controller('research-runs')
export class ResearchRunsController {
  constructor(
    private readonly runs: ResearchRunsService,
    private readonly discovery: ResearchDiscoveryService,
  ) {}

  @Post()
  create(@Session() session: AuthenticatedSession, @Body() input: CreateResearchRunDto) {
    return this.runs.create(session, input)
  }

  @Get()
  list(@Session() session: AuthenticatedSession) {
    return this.runs.list(session)
  }

  @Post(':id/discover')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  discover(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.discovery.discover(session, id)
  }

  @Post(':id/retry')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  retry(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.runs.retry(session, id)
  }

  @Post(':id/refresh')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  refresh(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.runs.refresh(session, id)
  }

  @Get(':id')
  get(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.runs.get(session, id)
  }
}
