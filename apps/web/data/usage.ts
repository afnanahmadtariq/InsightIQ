import type { PersonaId } from './personas'

export interface UsagePoint {
  date: string
  creditsUsed: number
}

export interface Invoice {
  id: string
  period: string
  amountUsd: number
  status: 'Paid' | 'Upcoming'
  issuedAt: string
}

const SEEDS: Record<PersonaId, number[]> = {
  'b2b-saas': [4, 6, 3, 7, 5, 2, 8, 6, 4, 9, 5, 3, 7, 6],
  'b2c-luxury': [1, 2, 1, 3, 0, 2, 1, 4, 2, 1, 3, 2, 1, 2],
  solopreneur: [2, 1, 3, 1, 2, 0, 1, 2, 3, 1, 2, 1, 3, 1],
}

export function usageHistoryForPersona(personaId: PersonaId): UsagePoint[] {
  const base = new Date('2026-08-15T00:00:00Z')
  return SEEDS[personaId].map((creditsUsed, index) => {
    const date = new Date(base)
    date.setUTCDate(date.getUTCDate() + index)
    return { date: date.toISOString(), creditsUsed }
  })
}

const INVOICE_SEEDS: Record<PersonaId, Array<[string, number]>> = {
  'b2b-saas': [
    ['Aug 2026', 129],
    ['Jul 2026', 129],
    ['Jun 2026', 129],
  ],
  'b2c-luxury': [
    ['Aug 2026', 49],
    ['Jul 2026', 49],
    ['Jun 2026', 49],
  ],
  solopreneur: [
    ['Aug 2026', 49],
    ['Jul 2026', 49],
  ],
}

export function invoicesForPersona(personaId: PersonaId): Invoice[] {
  return INVOICE_SEEDS[personaId].map(([period, amountUsd], index) => ({
    id: `INV-${personaId.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    period,
    amountUsd,
    status: index === 0 ? 'Upcoming' : 'Paid',
    issuedAt: `2026-${String(8 - index).padStart(2, '0')}-01T00:00:00Z`,
  }))
}
