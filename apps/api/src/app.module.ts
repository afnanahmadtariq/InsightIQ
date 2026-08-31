import { Body, Controller, Get, HttpException, HttpStatus, Module, Post } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AllowAnonymous, AuthModule } from '@thallesp/nestjs-better-auth'
import { db } from '@insightiq/db'
import { resolve } from 'node:path'
import { auth } from './auth/auth'
import { InsightIQAuthModule } from './auth/insightiq-auth.module'
import { validateEnvironment } from './config/env.validation'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

@Controller()
class HealthController {
  @Get('health')
  @AllowAnonymous()
  health() {
    return { status: 'ok' }
  }
}

@Controller('waitlist')
class WaitlistController {
  @Post()
  @AllowAnonymous()
  async join(@Body() body: { email?: unknown; name?: unknown }) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : ''

    if (!emailPattern.test(email) || email.length > 254) {
      throw new HttpException('Enter a valid email address.', HttpStatus.BAD_REQUEST)
    }

    await db.waitlistSignup.upsert({
      where: { email },
      update: name ? { name } : {},
      create: { email, name: name || null },
    })

    return { joined: true }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '1mb' },
        urlencoded: { limit: '1mb', extended: true },
      },
    }),
    InsightIQAuthModule,
  ],
  controllers: [HealthController, WaitlistController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
