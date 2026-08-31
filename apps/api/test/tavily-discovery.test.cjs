const assert = require('node:assert/strict')
const { test } = require('node:test')
const { buildDiscoveryQueries, deduplicateDiscoveredSources } = require('../dist/research/research-discovery.js')
const { normalizeTavilyResult } = require('../dist/tavily/tavily-search.service.js')

test('prospect discovery creates focused bounded queries without private email data', () => {
  const queries = buildDiscoveryQueries({
    name: 'Maya Chen',
    companyName: 'Northstar Labs',
    companyDomain: 'northstar.example',
    xHandle: '@mayachen',
  })

  assert.deepEqual(queries.map((query) => query.kind), [
    'prospect-profile',
    'company-overview',
    'recent-company-signals',
  ])
  assert.ok(queries.every((query) => query.query.length > 0 && query.query.length <= 400))
  assert.equal(queries.at(-1).topic, 'news')
  assert.equal(queries.at(-1).days, 90)
})

test('Tavily results are normalized into canonical citable sources', () => {
  const source = normalizeTavilyResult({
    id: 'result-1',
    title: ' Northstar launches a new product ',
    url: 'https://www.example.com/news/launch/?utm_source=test#section',
    content: ' A public launch announcement. ',
    score: 0.92,
    publishedDate: '2026-08-01',
  })

  assert.equal(source.url, 'https://www.example.com/news/launch')
  assert.equal(source.publisher, 'example.com')
  assert.equal(source.excerpt, 'A public launch announcement.')
  assert.equal(source.publishedAt.toISOString(), '2026-08-01T00:00:00.000Z')
  assert.equal(normalizeTavilyResult({
    id: 'unsafe', title: 'Unsafe', url: 'javascript:alert(1)', content: '', score: 1, publishedDate: '',
  }), null)
})

test('source deduplication retains query provenance and the strongest result', () => {
  const batches = [
    {
      kind: 'company-overview', query: 'overview', requestId: 'one', responseTimeMs: 100, credits: 1,
      sources: [{ url: 'https://example.com/about', title: 'About', publisher: 'example.com', excerpt: 'Old', publishedAt: null, score: 0.5 }],
    },
    {
      kind: 'recent-company-signals', query: 'signals', requestId: 'two', responseTimeMs: 120, credits: 1,
      sources: [{ url: 'https://example.com/about', title: 'About us', publisher: 'example.com', excerpt: 'New', publishedAt: null, score: 0.9 }],
    },
  ]

  const [source] = deduplicateDiscoveredSources(batches)
  assert.equal(source.title, 'About us')
  assert.equal(source.score, 0.9)
  assert.equal(source.matches.length, 2)
})
