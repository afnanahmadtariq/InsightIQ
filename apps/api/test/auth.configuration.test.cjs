const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const { validateEnvironment } = require('../dist/config/env.validation.js')
const { renderAuthEmail } = require('../dist/auth/auth-email.template.js')
const { renderLaunchEmail } = require('../dist/launch/launch-email.template.js')

const repositoryRoot = resolve(__dirname, '../../..')

test('development auth uses safe local defaults', () => {
  const environment = validateEnvironment({ NODE_ENV: 'development' })
  assert.equal(environment.BETTER_AUTH_URL, 'http://localhost:3001')
  assert.equal(environment.WEB_ORIGIN, 'http://localhost:3000')
})

test('production auth requires strong secrets and transactional email', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'production' }),
    /BETTER_AUTH_SECRET/,
  )
  assert.throws(
    () => validateEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'a-secure-production-secret-with-more-than-32-characters',
    }),
    /RESEND_API_KEY/,
  )
})

test('Google credentials must be configured as a pair', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'development', GOOGLE_CLIENT_ID: 'client-id' }),
    /configured together/,
  )
})

test('Better Auth account identity matches the 1.7 database contract', () => {
  const authSource = readFileSync(resolve(repositoryRoot, 'apps/api/src/auth/auth.ts'), 'utf8')
  const e2eSeedSource = readFileSync(resolve(repositoryRoot, 'apps/api/src/e2e/e2e-seed.service.ts'), 'utf8')
  const prismaSchema = readFileSync(resolve(repositoryRoot, 'packages/db/prisma/schema.prisma'), 'utf8')

  assert.match(authSource, /identityStrategy: 'provider-id'/)
  assert.match(prismaSchema, /model Account \{[\s\S]*?issuer\s+String/)
  assert.match(prismaSchema, /@@unique\(\[issuer, accountId\]\)/)
  assert.doesNotMatch(prismaSchema, /@@unique\(\[providerId, accountId\]\)/)
  assert.match(e2eSeedSource, /issuer: createLocalAccountIssuer\('credential'\)/)
  assert.match(e2eSeedSource, /accountId: userId/)
})

test('Tavily discovery settings are bounded and have useful defaults', () => {
  const environment = validateEnvironment({ NODE_ENV: 'development' })
  assert.equal(environment.TAVILY_SEARCH_DEPTH, 'advanced')
  assert.equal(environment.TAVILY_MAX_RESULTS, 6)
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'development', TAVILY_MAX_RESULTS: '21' }),
    /between 1 and 20/,
  )
})

test('authentication email is branded and escapes untrusted content', () => {
  const message = renderAuthEmail({
    kind: 'verification',
    title: 'Verify <InsightIQ>',
    message: 'Hello <script>alert(1)</script>',
    actionUrl: 'http://localhost:3000/auth/continue?next=<unsafe>',
  })

  assert.match(message.subject, /^\[InsightIQ\]/)
  assert.doesNotMatch(message.html, /<script>/)
  assert.match(message.html, /&lt;script&gt;/)
  assert.match(message.text, /http:\/\/localhost:3000/)

  const launch = renderLaunchEmail({ name: '<Alex>', actionUrl: 'https://insightiq.example/sign-up?from=<launch>' })
  assert.match(launch.subject, /InsightIQ is live/)
  assert.doesNotMatch(launch.html, /<Alex>/)
  assert.match(launch.html, /&lt;Alex&gt;/)
})
