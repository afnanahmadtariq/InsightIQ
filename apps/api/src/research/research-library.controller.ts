import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { Session } from '@thallesp/nestjs-better-auth'
import type { AuthenticatedSession } from '../auth/account-context.service'
import { ResearchLibraryService } from './research-library.service'

@Controller()
export class ResearchLibraryController {
  constructor(private readonly library: ResearchLibraryService) {}

  @Get('evidence')
  evidence(@Session() session: AuthenticatedSession) {
    return this.library.evidence(session)
  }

  @Get('deal-briefs')
  briefs(@Session() session: AuthenticatedSession) {
    return this.library.briefs(session)
  }

  @Get('deal-briefs/:id')
  brief(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.library.brief(session, id)
  }

  @Post('deal-briefs/:id/share')
  shareBrief(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.library.shareBrief(session, id)
  }

  @Delete('deal-briefs/:id/share')
  revokeBriefShare(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.library.revokeBriefShare(session, id)
  }

  @Get('shared/briefs/:token')
  @AllowAnonymous()
  sharedBrief(@Param('token') token: string) {
    return this.library.sharedBrief(token)
  }

  @Get('notifications')
  notifications(@Session() session: AuthenticatedSession) {
    return this.library.notifications(session)
  }

  @Post('notifications/:id/read')
  markNotificationRead(@Session() session: AuthenticatedSession, @Param('id') id: string) {
    return this.library.markNotificationRead(session, id)
  }

  @Delete('notifications')
  clearNotifications(@Session() session: AuthenticatedSession) {
    return this.library.clearNotifications(session)
  }

  @Get('integrations')
  capabilities(@Session() session: AuthenticatedSession) {
    return this.library.capabilities(session)
  }
}
