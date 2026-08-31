import { Module } from '@nestjs/common'
import { AccountContextController } from './account-context.controller'
import { AccountContextService } from './account-context.service'
import { AuthConfigController } from './auth-config.controller'

@Module({
  controllers: [AccountContextController, AuthConfigController],
  providers: [AccountContextService],
  exports: [AccountContextService],
})
export class InsightIQAuthModule {}
