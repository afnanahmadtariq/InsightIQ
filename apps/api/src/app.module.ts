import { Body, Controller, Get, HttpException, HttpStatus, Module, Post } from '@nestjs/common'
import { db } from '@insightiq/db'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' }
  }
}

@Controller('waitlist')
class WaitlistController {
  @Post()
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

@Module({ controllers: [HealthController, WaitlistController] })
export class AppModule {}
