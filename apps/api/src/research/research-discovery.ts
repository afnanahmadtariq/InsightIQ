import type { TavilyDiscoveryQuery, TavilySearchBatch, TavilySource } from '../tavily/tavily-search.service'

type ProspectDiscoveryInput = {
  name: string
  companyName: string | null
  companyDomain: string | null
  xHandle: string | null
}

export type DiscoveredSource = TavilySource & {
  matches: Array<{
    kind: string
    query: string
    requestId: string
    responseTimeMs: number
    credits: number | null
    score: number
  }>
}

function cleanTerm(value: string | null | undefined, maximum = 100) {
  return value?.replace(/["\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum) || ''
}

function quoted(value: string | null | undefined) {
  const term = cleanTerm(value)
  return term ? `"${term}"` : ''
}

function query(kind: string, topic: 'general' | 'news', parts: string[], days?: number): TavilyDiscoveryQuery {
  return {
    kind,
    topic,
    days,
    query: parts.filter(Boolean).join(' ').slice(0, 400),
  }
}

export function buildDiscoveryQueries(prospect: ProspectDiscoveryInput): TavilyDiscoveryQuery[] {
  const person = quoted(prospect.name)
  const company = quoted(prospect.companyName)
  const domain = cleanTerm(prospect.companyDomain, 253)
  const handle = cleanTerm(prospect.xHandle, 50)
  const identityContext = company || domain || handle
  const queries = [query('prospect-profile', 'general', [person, identityContext, 'professional profile role experience'])]

  if (company || domain) {
    queries.push(
      query('company-overview', 'general', [company, domain, 'products customers leadership company overview']),
      query('recent-company-signals', 'news', [company || domain, 'funding launch partnership hiring expansion'], 90),
    )
  } else if (handle) {
    queries.push(query('recent-prospect-signals', 'general', [person, handle, 'recent interview article announcement']))
  }

  return queries
}

export function deduplicateDiscoveredSources(batches: TavilySearchBatch[]) {
  const sources = new Map<string, DiscoveredSource>()
  for (const batch of batches) {
    for (const source of batch.sources) {
      const match = {
        kind: batch.kind,
        query: batch.query,
        requestId: batch.requestId,
        responseTimeMs: batch.responseTimeMs,
        credits: batch.credits,
        score: source.score,
      }
      const existing = sources.get(source.url)
      if (existing) {
        existing.matches.push(match)
        if (source.score > existing.score) Object.assign(existing, source, { matches: existing.matches })
      } else {
        sources.set(source.url, { ...source, matches: [match] })
      }
    }
  }
  return [...sources.values()].sort((left, right) => right.score - left.score)
}
