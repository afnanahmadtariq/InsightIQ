import type { TavilyDiscoveryQuery, TavilySearchBatch, TavilySource } from '../tavily/tavily-search.service'

export type ProspectDiscoveryInput = {
  name: string
  companyName: string | null
  companyDomain: string | null
  linkedinUrl: string | null
  xHandle: string | null
}

const MIN_DISCOVERY_SCORE = 0.35
const COMPANY_SUFFIX = /\b(?:incorporated|inc|llc|limited|ltd|corp(?:oration)?|company|co)\.?$/i
const LINKEDIN_DIRECTORY = /linkedin\.com\/(?:pub\/dir|search\/results)/i
const PROFILE_DIRECTORY_TITLE = /\b\d+\+?\s+["“]?.+?["”]?\s+profiles?\b/i

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

function normalized(value: string | null | undefined) {
  return cleanTerm(value, 500).toLowerCase()
}

function canonicalUrl(value: string | null | undefined) {
  try {
    const url = new URL(cleanTerm(value, 2_000))
    return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '').toLowerCase()}`
  } catch {
    return ''
  }
}

function companyTerms(prospect: ProspectDiscoveryInput) {
  const company = normalized(prospect.companyName)
  const unsuffixed = company.replace(COMPANY_SUFFIX, '').trim()
  const domain = normalized(prospect.companyDomain).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  const domainLabel = domain.split('.')[0]
  return [...new Set([company, unsuffixed, domain, domainLabel].filter((term) => term.length >= 3))]
}

function sourceMatchesIdentity(source: TavilySource, kind: string, prospect: ProspectDiscoveryInput) {
  const haystack = normalized(`${source.title} ${source.publisher} ${source.url} ${source.excerpt}`)
  const url = canonicalUrl(source.url)
  const exactLinkedin = canonicalUrl(prospect.linkedinUrl)
  const exactProfileMatch = Boolean(exactLinkedin && url === exactLinkedin)
  const personMatch = haystack.includes(normalized(prospect.name))
  const companyMatch = companyTerms(prospect).some((term) => haystack.includes(term))
  const handle = normalized(prospect.xHandle).replace(/^@/, '')
  const handleMatch = Boolean(handle && haystack.includes(handle))

  if (LINKEDIN_DIRECTORY.test(source.url) || PROFILE_DIRECTORY_TITLE.test(source.title)) return false
  if (source.score < MIN_DISCOVERY_SCORE && !exactProfileMatch) return false

  if (kind === 'prospect-profile' || kind === 'recent-prospect-signals') {
    const hasAnchor = companyMatch || handleMatch || exactProfileMatch
    return exactProfileMatch || (personMatch && hasAnchor)
  }

  if (kind === 'company-overview' || kind === 'recent-company-signals' || kind === 'company-hiring') return companyMatch
  if (kind === 'wikipedia-fallback') return companyMatch || (personMatch && !prospect.companyName)
  return false
}

export function filterDiscoveryBatches(batches: TavilySearchBatch[], prospect: ProspectDiscoveryInput) {
  return batches.map((batch) => ({
    ...batch,
    sources: batch.sources.filter((source) => sourceMatchesIdentity(source, batch.kind, prospect)),
  }))
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
  const linkedin = cleanTerm(prospect.linkedinUrl, 500)
  const handle = cleanTerm(prospect.xHandle, 50)
  const queries = [
    query('prospect-profile', 'general', [person, company, domain, linkedin, handle, 'professional profile role experience']),
  ]

  if (company || domain) {
    queries.push(
      query('company-overview', 'general', [company, domain, 'products customers leadership company overview']),
      query('recent-company-signals', 'news', [company || domain, 'funding launch partnership hiring expansion'], 90),
      query('company-hiring', 'news', [company || domain, 'hiring jobs open roles team expansion'], 60),
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
