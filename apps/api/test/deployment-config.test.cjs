const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')

const repositoryRoot = resolve(__dirname, '../../..')
const apiWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/deploy-vps.yml'), 'utf8')
const webWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/deploy-cloudflare.yml'), 'utf8')
const ciWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/ci.yml'), 'utf8')
const rootPackage = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')
const compose = readFileSync(resolve(repositoryRoot, 'docker-compose.yml'), 'utf8')
const playwrightConfig = readFileSync(resolve(repositoryRoot, 'apps/web/playwright.config.ts'), 'utf8')

test('production deployments are triggered by version tags, not branch pushes', () => {
  for (const workflow of [apiWorkflow, webWorkflow]) {
    assert.match(workflow, /push:\s*\n\s*tags:\s*\n\s*- ["']v\*["']/)
    assert.doesNotMatch(workflow, /push:\s*\n\s*branches:/)
  }
})

test('API deployment migrates first and recreates nginx separately', () => {
  const migrate = apiWorkflow.indexOf('docker compose run --rm --no-deps api migrate')
  const backend = apiWorkflow.indexOf('docker compose up -d --no-build --no-deps --wait --wait-timeout 60 api')
  const nginx = apiWorkflow.indexOf('docker compose up -d --no-build --force-recreate --remove-orphans --wait --wait-timeout 60 nginx')

  assert.ok(migrate > 0 && backend > migrate && nginx > backend)
  assert.doesNotMatch(apiWorkflow, /force-recreate[^\n]*api/)
  assert.match(apiWorkflow, /--force-recreate[^\n]*nginx/)
})

test('unused images are pruned only after service health checks', () => {
  const prune = apiWorkflow.indexOf('docker image prune -af')
  const finalHealth = apiWorkflow.lastIndexOf('docker compose ps -q --status running nginx')
  assert.ok(prune > finalHealth)
  assert.doesNotMatch(apiWorkflow, /docker (?:system|volume) prune/)
})

test('repository clean uses cross-platform rimraf through Turbo', () => {
  const parsed = JSON.parse(rootPackage)
  assert.match(parsed.scripts.clean, /turbo run clean/)
  assert.match(parsed.scripts.clean, /rimraf/)
})

test('deployment configuration contains no Kelvo paths or images', () => {
  assert.doesNotMatch(`${apiWorkflow}\n${webWorkflow}`, /kelvo/i)
})

test('API deployment passes project-scoped Tavily configuration to the container', () => {
  assert.match(compose, /TAVILY_API_KEY/)
  assert.match(compose, /TAVILY_PROJECT_ID/)
  assert.match(compose, /TAVILY_SEARCH_DEPTH/)
})

test('production deployment builds, pulls, and starts the worker service', () => {
  assert.match(compose, /WORKER_IMAGE/)
  assert.match(apiWorkflow, /WORKER_IMAGE_NAME/)
  assert.match(apiWorkflow, /Build and push worker image/)
  assert.match(apiWorkflow, /docker compose pull api worker/)
  assert.match(apiWorkflow, /docker compose up -d --no-build --no-deps --wait --wait-timeout 60 api worker/)
  assert.match(apiWorkflow, /docker compose ps -q --status running worker/)
})

test('CI prepares the Python worker before repository-wide quality gates', () => {
  const setupWorker = ciWorkflow.indexOf('npm run worker:setup')
  const lint = ciWorkflow.indexOf('npm run lint')
  const checkTypes = ciWorkflow.indexOf('npm run check-types')

  assert.ok(setupWorker > 0)
  assert.ok(lint > setupWorker)
  assert.ok(checkTypes > setupWorker)
})

test('real-stack browser tests isolate local auth trust and cookie settings', () => {
  assert.match(playwrightConfig, /BETTER_AUTH_TRUSTED_ORIGINS: `http:\/\/127\.0\.0\.1:\$\{webPort\}`/)
  assert.match(playwrightConfig, /BETTER_AUTH_COOKIE_DOMAIN: ''/)
})
