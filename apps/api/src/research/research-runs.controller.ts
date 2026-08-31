import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { Session } from '@thallesp/nestjs-better-auth'
import type { AuthenticatedSession } from '../auth/account-context.service'
import { CreateResearchRunDto } from './dto/create-research-run.dto'
import { ResearchRunsService } from './research-runs.service'

@Controller('research-runs')
export class ResearchRunsController {
  constructor(private readonly runs: ResearchRunsService) {}

  @Post()
  create(@Session() session: AuthenticatedSession, @Body() input: CreateResearchRunDto) {
    return this.runs.create(session, input)
  }

  @Get()
  list(@Session() session: AuthenticatedSession) {
    return this.runs.list(session)
  }

  @Get(':id')
  get(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.runs.get(session, id)
  }
}
