import { Module } from '@nestjs/common'
import { InsightIQAuthModule } from '../auth/insightiq-auth.module'
import { TavilyModule } from '../tavily/tavily.module'
import { ResearchDiscoveryService } from './research-discovery.service'
import { ResearchRunsController } from './research-runs.controller'
import { ResearchRunsService } from './research-runs.service'

@Module({
  imports: [InsightIQAuthModule, TavilyModule],
  controllers: [ResearchRunsController],
  providers: [ResearchRunsService, ResearchDiscoveryService],
})
export class ResearchModule {}
