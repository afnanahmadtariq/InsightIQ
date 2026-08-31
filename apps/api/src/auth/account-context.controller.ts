import { Controller, Get } from '@nestjs/common'
import { Session } from '@thallesp/nestjs-better-auth'
import { AccountContextService, type AuthenticatedSession } from './account-context.service'

@Controller('account-context')
export class AccountContextController {
  constructor(private readonly accounts: AccountContextService) {}

  @Get()
  getContext(@Session() session: AuthenticatedSession) {
    return this.accounts.getContext(session)
  }
}
