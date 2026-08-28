import type { PersonaId } from './personas'

export type RunStatus = 'completed' | 'in_progress' | 'queued' | 'needs_review'
export type RunDepth = 'standard' | 'deep'

export interface ResearchRun {
  id: string
  personaId: PersonaId
  accountName: string
  prospectName: string
  prospectTitle: string
  status: RunStatus
  depth: RunDepth
  creditsCost: number
  requestedAt: string
  completedAt: string | null
  matchConfidence: number
  hasBrief: boolean
}

const STATUS_WEIGHTS: RunStatus[] = [
  'completed', 'completed', 'completed', 'completed', 'completed',
  'in_progress', 'needs_review', 'queued',
]

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]
}

function isoDaysAgo(days: number, hourOffset = 9): string {
  const date = new Date('2026-08-28T12:00:00Z')
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(hourOffset)
  return date.toISOString()
}

const B2B_ACCOUNTS = [
  ['Vertexa Analytics', 'Dana Whitfield', 'VP of Data Platform'],
  ['Halcyon Freight Systems', 'Owen Baptiste', 'Head of Engineering'],
  ['Corridor Health', 'Renata Solis', 'Director of IT Infrastructure'],
  ['Fjord Robotics', 'Liam Okafor', 'CTO'],
  ['Basecamp Insurance Group', 'Priya Nair', 'VP Data & Analytics'],
  ['Ledgerline Fintech', 'Marcus Idowu', 'Head of Platform Engineering'],
  ['Northpeak Logistics', 'Elena Vasquez', 'Director of Operations Tech'],
  ['Aurora Biotech Labs', 'Sam Whitcombe', 'VP Engineering'],
  ['CedarStack Cloud', 'Grace Feldman', 'CTO'],
  ['Meridian Payments', 'Théo Girard', 'Head of Infrastructure'],
  ['Brightwell Retail Tech', 'Nia Osei', 'VP Data Engineering'],
  ['Solace Telecom', 'Aiden Marsh', 'Director of Platform'],
] as const

const B2C_ACCOUNTS = [
  ['Whitfield Family Trust', 'Julian & Marta Whitfield', 'Prospective Buyers'],
  ['Kessler Holdings', 'Richard Kessler', 'Managing Partner'],
  ['Delacroix Estate', 'Amélie Delacroix', 'Buyer'],
  ['Okonkwo-Reyes Household', 'David Okonkwo', 'Buyer'],
  ['Larkspur Capital', 'Vivian Larkspur', 'Principal'],
  ['Chen Family Office', 'Howard Chen', 'Family Office Director'],
  ['Ashworth Trust', 'Eleanor Ashworth', 'Buyer'],
  ['Petrova Ventures', 'Nikolai Petrov', 'Buyer'],
  ['Beaumont Group', 'Isabelle Beaumont', 'Buyer'],
  ['Hargrove Holdings', 'Thomas Hargrove', 'Buyer'],
] as const

const SOLO_ACCOUNTS = [
  ['Pulseform Analytics', 'Rachel Ito', 'Founder & CEO'],
  ['Brightline Kids', 'Marco Dellucci', 'Co-Founder'],
  ['Wanderwell Travel', 'Ines Duarte', 'Head of Growth'],
  ['Nutriloop', 'Jordan Blake', 'Founder'],
  ['Fablecraft Studio', 'Tomas Reyes', 'CEO'],
  ['GreenGrid Energy', 'Wei Lin', 'Co-Founder'],
  ['Havenly Homeshare', 'Sasha Novak', 'Founder & CEO'],
  ['Loopline Media', 'Ade Bello', 'Head of Marketing'],
] as const

function buildRuns(personaId: PersonaId, pool: readonly (readonly [string, string, string])[], prefix: string): ResearchRun[] {
  return pool.map(([accountName, prospectName, prospectTitle], index) => {
    const status = pick(STATUS_WEIGHTS, index * 3 + pool.length)
    const requestedDaysAgo = index * 2 + 1
    const isDeep = index % 4 === 1
    // The first run in each persona's pool is the hand-authored "flagship" with a full
    // Deal Brief fixture in data/briefs.ts (id ends in -001) — force it completed so the
    // detail page always has real content to link to. Later rows are list-filler only.
    const isFlagship = index === 0
    const resolvedStatus: RunStatus = isFlagship ? 'completed' : status
    return {
      id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
      personaId,
      accountName,
      prospectName,
      prospectTitle,
      status: resolvedStatus,
      depth: isDeep ? 'deep' : 'standard',
      creditsCost: isDeep ? 3 : 1,
      requestedAt: isoDaysAgo(requestedDaysAgo),
      completedAt: resolvedStatus === 'completed' || resolvedStatus === 'needs_review' ? isoDaysAgo(requestedDaysAgo, 11) : null,
      matchConfidence: 82 + ((index * 7) % 17),
      hasBrief: isFlagship,
    }
  })
}

export const RESEARCH_RUNS: ResearchRun[] = [
  ...buildRuns('b2b-saas', B2B_ACCOUNTS, 'RUN-NW'),
  ...buildRuns('b2c-luxury', B2C_ACCOUNTS, 'RUN-ME'),
  ...buildRuns('solopreneur', SOLO_ACCOUNTS, 'RUN-AG'),
]

export function runsForPersona(personaId: PersonaId): ResearchRun[] {
  return RESEARCH_RUNS.filter((run) => run.personaId === personaId)
}

export function findRun(id: string): ResearchRun | undefined {
  return RESEARCH_RUNS.find((run) => run.id === id)
}
