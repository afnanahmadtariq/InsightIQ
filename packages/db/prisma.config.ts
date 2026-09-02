import { config as loadEnvironment } from 'dotenv'
import { resolve } from 'node:path'
import { defineConfig, env } from 'prisma/config'

loadEnvironment({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: env('DATABASE_URL')
  }
})
