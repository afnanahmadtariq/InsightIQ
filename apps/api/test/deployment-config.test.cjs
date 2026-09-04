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
const researchJourney = readFileSync(resolve(repositoryRoot, 'apps/web/e2e/research-journey.spec.ts'), 'utf8')

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

test('only dangling images are pruned after service health checks so tagged rollback images remain', () => {
  const prune = apiWorkflow.indexOf('docker image prune -f')
  const finalHealth = apiWorkflow.lastIndexOf('docker compose ps -q --status running nginx')
  assert.ok(prune > finalHealth)
  assert.doesNotMatch(apiWorkflow, /docker image prune -af/)
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

test('API deployment passes Tavily discovery configuration to the container', () => {
  assert.match(compose, /TAVILY_API_KEY/)
  assert.match(compose, /TAVILY_SEARCH_DEPTH/)
  assert.match(compose, /TAVILY_MAX_RESULTS/)
})

test('production deployment builds, pulls, and starts the worker service', () => {
  assert.match(compose, /WORKER_IMAGE/)
  assert.match(apiWorkflow, /WORKER_IMAGE_NAME/)
  assert.match(apiWorkflow, /Build and push worker image/)
  assert.match(apiWorkflow, /docker compose pull api worker/)
  assert.match(apiWorkflow, /docker compose up -d --no-build --no-deps --wait --wait-timeout 60 api worker/)
  assert.match(apiWorkflow, /docker compose ps -q --status running worker/)
})

test('production release verifies worker code and backend integration tests', () => {
  assert.match(apiWorkflow, /npm run worker:setup/)
  assert.match(apiWorkflow, /npm run test -- --filter=@insightiq\/worker/)
  assert.match(apiWorkflow, /INTEGRATION_TESTS: ["']true["']/)
  assert.match(apiWorkflow, /node --test test\/\*\.integration\.test\.cjs/)
})

test('production deploy validates required provider settings before changing services', () => {
  const preflight = apiWorkflow.indexOf('for required in POSTGRES_PASSWORD')
  const pull = apiWorkflow.indexOf('docker compose pull api worker')
  assert.ok(preflight > 0 && pull > preflight)
  assert.match(apiWorkflow, /TAVILY_API_KEY DASHSCOPE_API_KEY/)
  assert.match(apiWorkflow, /docker compose config --quiet/)
})

test('production deploys cannot overlap', () => {
  for (const workflow of [apiWorkflow, webWorkflow]) {
    assert.match(workflow, /cancel-in-progress: false/)
  }
})

test('API image generates Prisma Client before compiling the database package', () => {
  const dockerfile = readFileSync(resolve(repositoryRoot, 'apps/api/Dockerfile'), 'utf8')
  const generate = dockerfile.indexOf('npm run generate --workspace=@insightiq/db')
  const build = dockerfile.indexOf('npm run build --workspace=@insightiq/db')
  assert.ok(generate > 0 && build > generate)
})

test('Cloudflare release installs its browser and validates an OpenNext artifact before deploy', () => {
  assert.match(webWorkflow, /npx playwright install chromium --with-deps/)
  assert.match(webWorkflow, /npm run cf:build --workspace=@insightiq\/web/)
  assert.match(webWorkflow, /npx wrangler deploy --dry-run/)
  assert.match(webWorkflow, /NEXT_PUBLIC_API_URL must be a non-empty HTTPS URL/)
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

test('real-stack browser tests build the database package before Playwright starts', () => {
  const realStackJob = ciWorkflow.slice(ciWorkflow.indexOf('e2e-real-stack:'))
  const generateDatabase = realStackJob.indexOf('npm run db:generate')
  const buildDatabase = realStackJob.indexOf('npm run build --workspace=@insightiq/db')
  const runPlaywright = realStackJob.indexOf('npx playwright test e2e/research-journey.spec.ts')

  assert.ok(generateDatabase >= 0 && buildDatabase > generateDatabase && runPlaywright > buildDatabase)
})

test('real-stack research journey follows the configured API port', () => {
  assert.match(researchJourney, /process\.env\.E2E_API_PORT/)
})
