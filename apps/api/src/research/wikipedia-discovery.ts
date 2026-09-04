export type WikipediaSource = {
  url: string
  title: string
  publisher: string
  excerpt: string
  score: number
  query: string
}

const WRONG_TOPIC = ['fruit', 'plant', 'album', 'film', 'song', 'disambiguation']
const BUSINESS_TOPIC = ['inc.', 'inc', 'company', 'corporation', 'technology', 'software', 'chief executive']

function cleanTerm(value: string | null | undefined, maximum = 100) {
  return value?.replace(/["\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum) || ''
}

export function buildWikipediaQueries(prospect: {
  name: string
  companyName: string | null
}) {
  const queries: Array<{ term: string; hints: string[] }> = []
  const person = cleanTerm(prospect.name)
  if (person) {
    queries.push({
      term: person,
      hints: [person.split(' ').slice(-1)[0] || '', 'technology', 'company'].filter((token) => token.length >= 3),
    })
  }
  const company = cleanTerm(prospect.companyName)
  if (company) {
    queries.push({
      term: company.includes(' ') ? company : `${company} Inc.`,
      hints: [person.split(' ').slice(-1)[0] || '', 'technology', 'company'].filter((token) => token.length >= 3),
    })
  }
  return queries
}

export function scoreWikipediaHit(
  hit: { title?: string; snippet?: string },
  hints: string[],
  query: string,
) {
  const title = String(hit.title || '').toLowerCase()
  const snippet = String(hit.snippet || '').replace(/<[^>]+>/g, ' ').toLowerCase()
  const queryLower = query.trim().toLowerCase()
  if (title === queryLower) return 100

  let score = 0
  if (BUSINESS_TOPIC.some((token) => title.includes(token))) score += 4
  if (BUSINESS_TOPIC.some((token) => snippet.includes(token))) score += 2
  for (const hint of hints) {
    const token = hint.toLowerCase().trim()
    if (token.length >= 3 && (title.includes(token) || snippet.includes(token))) score += 3
  }
  const nameParts = queryLower.split(' ').filter((part) => part.length >= 3)
  if (nameParts.length) {
    if (nameParts.every((part) => title.includes(part))) score += 8
    else if (nameParts.some((part) => title.includes(part))) score += 4
    else score -= 8
  }
  if (WRONG_TOPIC.some((token) => title.includes(token))) score -= 6
  if (['edible fruit', 'apple tree', 'fruit tree', 'genus malus'].some((token) => snippet.includes(token))) score -= 6
  return score
}

export function deduplicateWikipediaSources(sources: WikipediaSource[]) {
  const byUrl = new Map<string, WikipediaSource>()
  for (const source of sources) {
    const existing = byUrl.get(source.url)
    if (!existing || source.score > existing.score) byUrl.set(source.url, source)
  }
  return [...byUrl.values()].sort((left, right) => right.score - left.score)
}
