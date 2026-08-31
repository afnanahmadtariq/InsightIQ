const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')

const repositoryRoot = resolve(__dirname, '../../..')
const apiWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/deploy-vps.yml'), 'utf8')
const webWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/deploy-cloudflare.yml'), 'utf8')
const rootPackage = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')

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
