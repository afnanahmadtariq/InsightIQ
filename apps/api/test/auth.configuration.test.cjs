const assert = require('node:assert/strict')
const { test } = require('node:test')
const { validateEnvironment } = require('../dist/config/env.validation.js')
const { renderAuthEmail } = require('../dist/auth/auth-email.template.js')

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
})
