const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  buildWikipediaQueries,
  deduplicateWikipediaSources,
  scoreWikipediaHit,
} = require('../dist/research/wikipedia-discovery.js')

test('Wikipedia queries stay bounded and include person plus company lookups', () => {
  const queries = buildWikipediaQueries({ name: 'Tim Cook', companyName: 'Apple' })
  assert.equal(queries.length, 2)
  assert.equal(queries[0].term, 'Tim Cook')
  assert.equal(queries[1].term, 'Apple Inc.')
})

test('Wikipedia scoring prefers business topics over disambiguation pages', () => {
  const good = scoreWikipediaHit(
    { title: 'Tim Cook', snippet: 'chief executive officer of Apple Inc.' },
    ['Cook', 'technology'],
    'Tim Cook',
  )
  const bad = scoreWikipediaHit(
    { title: 'Apple (fruit)', snippet: 'edible fruit from the apple tree' },
    ['Cook', 'technology'],
    'Apple',
  )
  assert.ok(good > bad)
})

test('Wikipedia deduplication keeps the strongest page per URL', () => {
  const sources = deduplicateWikipediaSources([
    {
      url: 'https://en.wikipedia.org/wiki/Tim_Cook',
      title: 'Wikipedia · Tim Cook',
      publisher: 'Wikipedia',
      excerpt: 'CEO of Apple Inc.',
      score: 0.7,
      query: 'Tim Cook',
    },
    {
      url: 'https://en.wikipedia.org/wiki/Tim_Cook',
      title: 'Wikipedia · Tim Cook',
      publisher: 'Wikipedia',
      excerpt: 'CEO of Apple Inc.',
      score: 0.9,
      query: 'Tim Cook',
    },
  ])
  assert.equal(sources.length, 1)
  assert.equal(sources[0].score, 0.9)
})
