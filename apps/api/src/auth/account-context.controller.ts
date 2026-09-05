import { Body, Controller, Get, Post } from '@nestjs/common'
import { Session } from '@thallesp/nestjs-better-auth'
import { AccountContextService, type AuthenticatedSession } from './account-context.service'

@Controller('account-context')
export class AccountContextController {
  constructor(private readonly accounts: AccountContextService) {}

  @Get()
  getContext(@Session() session: AuthenticatedSession) {
    return this.accounts.getContext(session)
  }

  @Post('security-confirmations')
  sendSecurityConfirmation(@Session() session: AuthenticatedSession, @Body() body: { action?: string }) {
    return this.accounts.sendSecurityConfirmation(session, body?.action)
  }

  @Post('security-confirmations/verify')
  verifySecurityConfirmation(@Session() session: AuthenticatedSession, @Body() body: { action?: string; code?: string }) {
    return this.accounts.verifySecurityConfirmation(session, body?.action, body?.code)
  }
}
