export type PersonaId = 'b2b-saas' | 'b2c-luxury' | 'solopreneur'

export interface Persona {
  id: PersonaId
  segment: string
  accent: 'persona-b2b' | 'persona-b2c' | 'persona-solo'
  user: {
    name: string
    title: string
    initials: string
  }
  workspace: {
    name: string
    plan: 'Solo' | 'Pro' | 'Team'
    seats: number
  }
  offer: string
  credits: {
    balance: number
    monthlyAllowance: number
    renewsOn: string
  }
  headline: string
  description: string
}

export const PERSONAS: Record<PersonaId, Persona> = {
  'b2b-saas': {
    id: 'b2b-saas',
    segment: 'B2B SaaS Account Executive',
    accent: 'persona-b2b',
    user: { name: 'Marcus Chen', title: 'Senior Account Executive', initials: 'MC' },
    workspace: { name: 'Northwind Cloud Sales', plan: 'Pro', seats: 3 },
    offer: 'Enterprise data-observability platform (usage-based pricing, SOC 2 Type II)',
    credits: { balance: 96, monthlyAllowance: 150, renewsOn: '2026-09-14' },
    headline: 'Every enterprise deal, fully briefed before the first call.',
    description:
      'Marcus runs a full-cycle enterprise SaaS pipeline. InsightIQ turns stalled LinkedIn research into cited, board-ready deal briefs in minutes.',
  },
  'b2c-luxury': {
    id: 'b2c-luxury',
    segment: 'High-Ticket B2C — Luxury Real Estate',
    accent: 'persona-b2c',
    user: { name: 'Sofia Marchetti', title: 'Luxury Property Advisor', initials: 'SM' },
    workspace: { name: 'Marchetti Estates Group', plan: 'Solo', seats: 1 },
    offer: 'Off-market waterfront and penthouse listings, $3M–$25M',
    credits: { balance: 22, monthlyAllowance: 40, renewsOn: '2026-09-05' },
    headline: 'Meet every high-net-worth buyer already knowing what matters to them.',
    description:
      'Sofia closes on trust and discretion. InsightIQ surfaces verified public context on buyers so every showing feels personally curated.',
  },
  solopreneur: {
    id: 'solopreneur',
    segment: 'Independent Consultant / Solopreneur',
    accent: 'persona-solo',
    user: { name: 'Priya Anand', title: 'Fractional Growth Consultant', initials: 'PA' },
    workspace: { name: 'Anand Growth Studio', plan: 'Solo', seats: 1 },
    offer: 'Fractional growth-marketing engagements for seed–Series B startups',
    credits: { balance: 14, monthlyAllowance: 40, renewsOn: '2026-09-20' },
    headline: 'One-person sales team, research team of an agency.',
    description:
      'Priya wears every hat. InsightIQ replaces hours of manual prospect digging with a ready-made pitch angle for each lead.',
  },
}

export const PERSONA_LIST = Object.values(PERSONAS)
