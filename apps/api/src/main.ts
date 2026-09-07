import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { config as loadEnvironment } from 'dotenv'
import { resolve } from 'node:path'

loadEnvironment({ path: resolve(process.cwd(), '.env') })
loadEnvironment({ path: resolve(process.cwd(), '../../.env') })

async function bootstrap() {
  const { AppModule } = await import('./app.module')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
  app.set('trust proxy', 1)
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',').map((origin) => origin.trim()) ?? ['http://localhost:3000'],
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true,
    forbidNonWhitelisted: true,
  }))
  await app.listen(process.env.PORT ?? 3001, process.env.LISTEN_HOST ?? '0.0.0.0')
}

void bootstrap()
