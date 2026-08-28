import type { PersonaId } from './personas'

export interface Citation {
  id: string
  label: string
  sourceType: 'News' | 'Company Site' | 'Job Posting' | 'Social Profile' | 'Filing' | 'Press Release'
  url: string
  retrievedAt: string
}

export interface Signal {
  id: string
  label: string
  detail: string
  confidence: 'High' | 'Medium' | 'Low'
  citationIds: string[]
}

export interface ObjectionResponse {
  objection: string
  response: string
}

export interface DealBrief {
  id: string
  runId: string
  personaId: PersonaId
  accountName: string
  prospectName: string
  prospectTitle: string
  companySummary: string
  signals: Signal[]
  talkingPoints: string[]
  objections: ObjectionResponse[]
  questions: string[]
  outreachDraft: { subject: string; body: string }
  citations: Citation[]
}

export const DEAL_BRIEFS: Record<string, DealBrief> = {
  'RUN-NW-001': {
    id: 'BRIEF-NW-001',
    runId: 'RUN-NW-001',
    personaId: 'b2b-saas',
    accountName: 'Vertexa Analytics',
    prospectName: 'Dana Whitfield',
    prospectTitle: 'VP of Data Platform',
    companySummary:
      'Vertexa Analytics is a Series C data-infrastructure company (240 employees) that just closed a $48M round and is scaling its platform team aggressively after a Q2 outage that drew public scrutiny.',
    signals: [
      { id: 'sig-1', label: 'Just raised $48M Series C', detail: 'Announced 11 days ago; explicitly earmarked for "platform reliability and observability tooling."', confidence: 'High', citationIds: ['c1', 'c2'] },
      { id: 'sig-2', label: 'Hiring surge on data platform team', detail: '7 open reqs for platform/SRE roles posted in the last 3 weeks, up from 1 the quarter before.', confidence: 'High', citationIds: ['c3'] },
      { id: 'sig-3', label: 'Recent public incident', detail: 'A 4-hour outage in June was covered in a trade newsletter; postmortem cited "lack of end-to-end lineage visibility."', confidence: 'Medium', citationIds: ['c4'] },
      { id: 'sig-4', label: 'Dana posted about data-quality debt', detail: 'LinkedIn post (3 weeks ago) about the team "finally getting budget to fix data quality properly."', confidence: 'Medium', citationIds: ['c5'] },
    ],
    talkingPoints: [
      'Open with the Series C — frame the platform investment as protecting that raise, not adding cost.',
      'Reference the June outage postmortem without dwelling on it; pivot straight to lineage + observability as the fix.',
      "Dana's hiring 7 platform roles — position InsightIQ's target platform as a force-multiplier for a team that's about to triple in size.",
      'Anchor on usage-based pricing since Vertexa itself sells usage-based — the pricing model will resonate internally.',
    ],
    objections: [
      { objection: '"We just hired a platform team to build this in-house."', response: 'Reframe as build-vs-buy on the observability layer specifically — their new hires can focus on core data product work instead of tooling plumbing.' },
      { objection: '"We already have budget allocated elsewhere from the raise."', response: 'Ask what "platform reliability" line item from the funding announcement maps to — it was explicitly named in their own press release.' },
      { objection: '"SOC 2 and security review will take too long."', response: 'Lead with the SOC 2 Type II report and offer to start the security review in parallel with the technical eval, not after it.' },
    ],
    questions: [
      'What did the June outage postmortem actually recommend the team prioritize?',
      'Of the 7 open platform reqs, how many are backfill vs. net-new headcount?',
      'Who else sits in the reliability/observability budget conversation besides Dana?',
    ],
    outreachDraft: {
      subject: 'Congrats on the raise, Dana — quick thought on the June postmortem',
      body: "Hi Dana,\n\nCongrats on the $48M round — saw it's earmarked partly for platform reliability, which tracks with the growth I'm seeing on your team's hiring page.\n\nWe work with a few data infra teams your size who hit a similar wall after an incident like June's: lineage and observability tooling that scales with headcount instead of fighting it. Given the reqs you have open, happy to share how a team like Northpeak's platform group cut incident MTTR by 40% in a similar spot.\n\nWorth 20 minutes this week?\n\nMarcus",
    },
    citations: [
      { id: 'c1', label: 'Vertexa Analytics closes $48M Series C', sourceType: 'News', url: 'https://example-news.test/vertexa-series-c', retrievedAt: '2026-08-17T14:02:00Z' },
      { id: 'c2', label: 'Vertexa press release — funding use of proceeds', sourceType: 'Press Release', url: 'https://vertexa.example/press/series-c', retrievedAt: '2026-08-17T14:05:00Z' },
      { id: 'c3', label: 'Vertexa careers — Platform & SRE openings', sourceType: 'Job Posting', url: 'https://vertexa.example/careers', retrievedAt: '2026-08-24T09:11:00Z' },
      { id: 'c4', label: 'Trade newsletter — Vertexa June incident recap', sourceType: 'News', url: 'https://example-trade.test/vertexa-outage-recap', retrievedAt: '2026-08-20T10:30:00Z' },
      { id: 'c5', label: 'Dana Whitfield — LinkedIn post on data quality budget', sourceType: 'Social Profile', url: 'https://linkedin.example/posts/dana-whitfield-dataquality', retrievedAt: '2026-08-22T16:47:00Z' },
    ],
  },
  'RUN-ME-001': {
    id: 'BRIEF-ME-001',
    runId: 'RUN-ME-001',
    personaId: 'b2c-luxury',
    accountName: 'Whitfield Family Trust',
    prospectName: 'Julian & Marta Whitfield',
    prospectTitle: 'Prospective Buyers',
    companySummary:
      'The Whitfields relocated their family office from Chicago to Miami eight months ago and have attended three waterfront open houses in the last quarter without making an offer — signaling active but selective intent.',
    signals: [
      { id: 'sig-1', label: 'Relocated family office to Miami', detail: 'Julian filed a change-of-registered-agent for Whitfield Capital LLC to a Miami address 8 months ago.', confidence: 'High', citationIds: ['c1'] },
      { id: 'sig-2', label: 'Attended 3 comparable open houses', detail: 'Publicly listed open-house sign-in coverage places them at two waterfront listings in Coconut Grove and one in Bal Harbour.', confidence: 'Medium', citationIds: ['c2'] },
      { id: 'sig-3', label: 'Marta active in a design-forward community', detail: 'Marta follows and engages with several architectural-renovation accounts, suggesting appetite for a renovation project vs. turnkey.', confidence: 'Medium', citationIds: ['c3'] },
      { id: 'sig-4', label: 'No offers made yet after 3 showings', detail: 'Pattern suggests price anchoring or a specific unmet criterion rather than lack of intent.', confidence: 'Low', citationIds: ['c2'] },
    ],
    talkingPoints: [
      'Open on the Miami relocation — establish this as a long-term move, not a vacation-home purchase.',
      "Given Marta's design interest, lead with the off-market listing that has renovation upside rather than the fully-finished one.",
      'Address the pattern of no offers directly and gently: ask what has been missing from the last three showings.',
    ],
    objections: [
      { objection: '"We are still just looking."', response: "Acknowledge it, then narrow: ask specifically what's held them back from the last three — that answer routes the rest of the search." },
      { objection: '"Price per square foot feels high for the area."', response: 'Bring comparable off-market close prices in Bal Harbour from the last two quarters, not public listing prices.' },
    ],
    questions: [
      'Was there a specific feature missing from the Coconut Grove or Bal Harbour showings?',
      'Is Marta open to a renovation-upside property, or is turnkey a hard requirement?',
      'What is the actual timeline behind the Miami relocation — is there a tax-residency deadline?',
    ],
    outreachDraft: {
      subject: 'A quieter option in Bal Harbour, before it lists',
      body: "Julian, Marta —\n\nHope the move to Miami has settled in well. I have an off-market waterfront property in Bal Harbour that hasn't hit the open market yet — thought of you both given the architectural character, which felt closer to what you two have been drawn to.\n\nWould love to walk you through it privately before it's shown more broadly. Any afternoon this week or next work?\n\nSofia",
    },
    citations: [
      { id: 'c1', label: 'Florida registered-agent filing — Whitfield Capital LLC', sourceType: 'Filing', url: 'https://sunbiz.example/whitfield-capital', retrievedAt: '2026-08-15T13:20:00Z' },
      { id: 'c2', label: 'Open house attendance coverage — Coconut Grove & Bal Harbour listings', sourceType: 'News', url: 'https://example-realty.test/open-house-notes', retrievedAt: '2026-08-21T11:05:00Z' },
      { id: 'c3', label: 'Marta Whitfield — public social activity on design accounts', sourceType: 'Social Profile', url: 'https://instagram.example/marta.whitfield', retrievedAt: '2026-08-23T09:40:00Z' },
    ],
  },
  'RUN-AG-001': {
    id: 'BRIEF-AG-001',
    runId: 'RUN-AG-001',
    personaId: 'solopreneur',
    accountName: 'Pulseform Analytics',
    prospectName: 'Rachel Ito',
    prospectTitle: 'Founder & CEO',
    companySummary:
      'Pulseform Analytics is a 9-person seed-stage startup (raised $2.1M 5 months ago) whose founder just posted publicly about struggling to find product-market fit for their self-serve funnel.',
    signals: [
      { id: 'sig-1', label: 'Raised $2.1M seed, 5 months ago', detail: 'Runway pressure likely building; growth spend is probably under scrutiny.', confidence: 'High', citationIds: ['c1'] },
      { id: 'sig-2', label: 'Founder publicly flagged self-serve funnel struggles', detail: 'Rachel posted on X about activation rate stalling below target for two straight months.', confidence: 'High', citationIds: ['c2'] },
      { id: 'sig-3', label: 'No dedicated growth hire yet', detail: 'Team page lists engineering and design only — growth work is currently on Rachel.', confidence: 'Medium', citationIds: ['c3'] },
    ],
    talkingPoints: [
      'Lead with the funnel post directly — it shows you did the homework and respects her time.',
      'Position fractional growth support as the fastest way to buy back her time before a Series A push.',
      'Use the "no growth hire yet" gap as the entry point — this is a fill-in, not a replacement pitch.',
    ],
    objections: [
      { objection: '"We can\'t afford a full engagement right now."', response: 'Offer a scoped 2-week funnel audit first — small enough to fit runway, big enough to prove the model.' },
      { objection: '"We tried an agency before and it didn\'t work."', response: 'Ask what specifically failed — usually it\'s lack of hands-on execution, which a fractional model solves directly.' },
    ],
    questions: [
      'What does the activation funnel look like today, step by step?',
      'Is there a Series A timeline this needs to support?',
      'Has anyone owned growth full-time, even part of the time, so far?',
    ],
    outreachDraft: {
      subject: 'Saw your post on the activation stall — one idea',
      body: "Hi Rachel,\n\nSaw your post about activation rate stalling the last two months — that's a really common wall right around the seed-to-A gap, especially without a dedicated growth owner yet.\n\nI work fractionally with founders in exactly that spot. Happy to do a free 20-minute teardown of your funnel, no pitch attached, just to see if there's an obvious lever.\n\nOpen to a quick call this week?\n\nPriya",
    },
    citations: [
      { id: 'c1', label: 'Pulseform Analytics seed round announcement', sourceType: 'News', url: 'https://example-startups.test/pulseform-seed', retrievedAt: '2026-08-19T08:15:00Z' },
      { id: 'c2', label: 'Rachel Ito — public post on activation funnel struggles', sourceType: 'Social Profile', url: 'https://x.example/rachelito/status/funnel', retrievedAt: '2026-08-25T17:02:00Z' },
      { id: 'c3', label: 'Pulseform Analytics — team page', sourceType: 'Company Site', url: 'https://pulseform.example/team', retrievedAt: '2026-08-25T17:10:00Z' },
    ],
  },
}

export function briefForRun(runId: string): DealBrief | undefined {
  return DEAL_BRIEFS[runId]
}
