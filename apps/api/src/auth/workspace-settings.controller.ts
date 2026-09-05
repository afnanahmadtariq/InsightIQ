import { Body, Controller, Delete, Get, Patch } from '@nestjs/common'
import { Session } from '@thallesp/nestjs-better-auth'
import type { AuthenticatedSession } from './account-context.service'
import { WorkspaceSettingsService } from './workspace-settings.service'

@Controller('workspace-settings')
export class WorkspaceSettingsController {
  constructor(private readonly settings: WorkspaceSettingsService) {}

  @Get()
  getSettings(@Session() session: AuthenticatedSession) {
    return this.settings.getSettings(session)
  }

  @Patch()
  updateWorkspace(@Session() session: AuthenticatedSession, @Body() body: { name?: string }) {
    return this.settings.updateWorkspace(session, body?.name)
  }

  @Delete('briefs')
  deleteBriefs(@Session() session: AuthenticatedSession, @Body() body: { confirmation?: string }) {
    return this.settings.deleteWorkspaceBriefs(session, body?.confirmation)
  }

  @Delete('research-data')
  wipeResearchData(@Session() session: AuthenticatedSession, @Body() body: { confirmation?: string }) {
    return this.settings.wipeWorkspaceResearchData(session, body?.confirmation)
  }

  @Delete()
  deleteWorkspace(@Session() session: AuthenticatedSession, @Body() body: { confirmation?: string }) {
    return this.settings.deleteWorkspace(session, body?.confirmation)
  }
}
