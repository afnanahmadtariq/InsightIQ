const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  buildDiscoveryQueries,
  deduplicateDiscoveredSources,
  filterDiscoveryBatches,
} = require('../dist/research/research-discovery.js')
const { normalizeTavilyResult } = require('../dist/tavily/tavily-search.service.js')

test('prospect discovery creates focused bounded queries without private email data', () => {
  const queries = buildDiscoveryQueries({
    name: 'Maya Chen',
    companyName: 'Northstar Labs',
    companyDomain: 'northstar.example',
    linkedinUrl: 'https://www.linkedin.com/in/maya-chen',
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

test('prospect discovery includes a supplied LinkedIn URL as an identity anchor', () => {
  const [profile] = buildDiscoveryQueries({
    name: 'Maya Chen', companyName: null, companyDomain: null,
    linkedinUrl: 'https://www.linkedin.com/in/maya-chen', xHandle: null,
  })

  assert.match(profile.query, /linkedin\.com\/in\/maya-chen/)
})

test('identity filtering rejects directories and same-name profiles from another company', () => {
  const prospect = {
    name: 'Danyal Rana', companyName: 'Northstar Labs', companyDomain: 'northstar.example',
    linkedinUrl: null, xHandle: null,
  }
  const [filtered] = filterDiscoveryBatches([{
    kind: 'prospect-profile', query: 'query', requestId: 'one', responseTimeMs: 100, credits: 1,
    sources: [
      {
        url: 'https://linkedin.com/pub/dir/Danyal/Rana', title: '10+ "Danyal Rana" profiles',
        publisher: 'linkedin.com', excerpt: 'Find people named Danyal Rana.', publishedAt: null, score: 0.98,
      },
      {
        url: 'https://example.com/danyal-rana', title: 'Danyal Rana at Other Corp',
        publisher: 'example.com', excerpt: 'Danyal Rana works at Other Corp.', publishedAt: null, score: 0.92,
      },
      {
        url: 'https://northstar.example/team/danyal', title: 'Danyal Rana — Northstar Labs',
        publisher: 'northstar.example', excerpt: 'Danyal Rana leads sales at Northstar Labs.', publishedAt: null, score: 0.86,
      },
    ],
  }], prospect)

  assert.deepEqual(filtered.sources.map((source) => source.url), ['https://northstar.example/team/danyal'])
})

test('company signal filtering requires the supplied company identity', () => {
  const prospect = {
    name: 'Maya Chen', companyName: 'Northstar Labs', companyDomain: 'northstar.example',
    linkedinUrl: null, xHandle: null,
  }
  const [filtered] = filterDiscoveryBatches([{
    kind: 'recent-company-signals', query: 'query', requestId: 'one', responseTimeMs: 100, credits: 1,
    sources: [
      {
        url: 'https://news.example/other', title: 'Other company raises funding', publisher: 'news.example',
        excerpt: 'A similarly named business raised funding.', publishedAt: null, score: 0.9,
      },
      {
        url: 'https://news.example/northstar', title: 'Northstar Labs expands', publisher: 'news.example',
        excerpt: 'Northstar Labs expanded its sales team.', publishedAt: null, score: 0.8,
      },
    ],
  }], prospect)

  assert.deepEqual(filtered.sources.map((source) => source.url), ['https://news.example/northstar'])
})

test('Wikipedia fallback keeps a matching company page and rejects unrelated pages', () => {
  const prospect = {
    name: 'Maya Chen', companyName: 'Northstar Labs', companyDomain: null,
    linkedinUrl: null, xHandle: null,
  }
  const [filtered] = filterDiscoveryBatches([{
    kind: 'wikipedia-fallback', query: 'Northstar Labs', requestId: 'wikipedia', responseTimeMs: 0, credits: null,
    sources: [
      {
        url: 'https://en.wikipedia.org/wiki/Northstar_Labs', title: 'Wikipedia · Northstar Labs',
        publisher: 'Wikipedia', excerpt: 'Northstar Labs is a software company.', publishedAt: null, score: 0.85,
      },
      {
        url: 'https://en.wikipedia.org/wiki/North_Star', title: 'Wikipedia · North Star',
        publisher: 'Wikipedia', excerpt: 'The North Star is a prominent star.', publishedAt: null, score: 0.9,
      },
    ],
  }], prospect)

  assert.deepEqual(filtered.sources.map((source) => source.url), ['https://en.wikipedia.org/wiki/Northstar_Labs'])
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
