import { Module } from '@nestjs/common'
import { InsightIQAuthModule } from '../auth/insightiq-auth.module'
import { ResearchRunsController } from './research-runs.controller'
import { ResearchRunsService } from './research-runs.service'

@Module({
  imports: [InsightIQAuthModule],
  controllers: [ResearchRunsController],
  providers: [ResearchRunsService],
})
export class ResearchModule {}
