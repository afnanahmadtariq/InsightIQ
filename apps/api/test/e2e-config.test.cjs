const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')

const repositoryRoot = resolve(__dirname, '../../..')
const appModule = readFileSync(resolve(repositoryRoot, 'apps/api/src/app.module.ts'), 'utf8')
const seedService = readFileSync(resolve(repositoryRoot, 'apps/api/src/e2e/e2e-seed.service.ts'), 'utf8')

test('e2e module is gated behind E2E_ENABLED', () => {
  assert.match(appModule, /E2E_ENABLED/)
  assert.match(appModule, /E2eModule/)
})

test('e2e seed refuses production and missing secret configuration', () => {
  assert.match(seedService, /NODE_ENV === 'production'/)
  assert.match(seedService, /E2E_ENABLED !== 'true'/)
  assert.match(seedService, /E2E_SEED_SECRET/)
})

test('playwright scripts exist for the web workspace', () => {
  const webPackage = JSON.parse(readFileSync(resolve(repositoryRoot, 'apps/web/package.json'), 'utf8'))
  assert.match(webPackage.scripts['test:e2e'], /playwright test/)
  assert.ok(webPackage.devDependencies['@playwright/test'])
})
