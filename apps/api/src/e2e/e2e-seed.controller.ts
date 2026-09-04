import { Controller, Headers, NotFoundException, Post } from '@nestjs/common'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { E2eSeedService } from './e2e-seed.service'

@Controller('e2e')
export class E2eSeedController {
  constructor(private readonly seed: E2eSeedService) {}

  @Post('seed')
  @AllowAnonymous()
  async create(@Headers('x-e2e-secret') secret?: string) {
    const expected = this.seed.assertEnabled()
    if (secret !== expected) throw new NotFoundException()
    return this.seed.seed()
  }
}
