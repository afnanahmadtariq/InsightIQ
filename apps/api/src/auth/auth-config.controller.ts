import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@AllowAnonymous()
@Controller('auth-config')
export class AuthConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getConfiguration() {
    return {
      googleEnabled: Boolean(this.config.get<string>('GOOGLE_CLIENT_ID') && this.config.get<string>('GOOGLE_CLIENT_SECRET')),
      passwordEnabled: true,
      twoFactorMethods: ['totp', 'email'] as const,
    }
  }
}
