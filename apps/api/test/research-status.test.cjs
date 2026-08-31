const assert = require('node:assert/strict')
const { test } = require('node:test')
const { canTransitionResearchStatus } = require('../dist/research/research-status.js')

test('research runs follow an explicit asynchronous lifecycle', () => {
  assert.equal(canTransitionResearchStatus('queued', 'running'), true)
  assert.equal(canTransitionResearchStatus('running', 'completed'), true)
  assert.equal(canTransitionResearchStatus('running', 'failed'), true)
  assert.equal(canTransitionResearchStatus('completed', 'running'), false)
  assert.equal(canTransitionResearchStatus('failed', 'queued'), true)
})
