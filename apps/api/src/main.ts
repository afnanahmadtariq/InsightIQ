import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'

async function bootstrap() {
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
  await app.listen(process.env.PORT ?? 3001)
}

void bootstrap()
