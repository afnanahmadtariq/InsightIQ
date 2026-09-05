export interface BriefCitation {
  evidence_id: string
  claim: string
  source_url: string
  signal_type: string
}

export interface BriefSections {
  summary?: string
  key_signals?: BriefCitation[]
  talking_points?: string[]
  questions_to_ask?: string[]
  personalized_opener?: string
  objection_handling?: string[]
  next_steps?: string[]
  outreach_draft?: string
  gaps?: string[]
  urgency_score?: number
  urgency_label?: 'High urgency' | 'Moderate' | 'Low'
}

export interface ResearchEvidenceItem {
  id: string
  claim: string
  signalType: string
  confidence: number
  observedAt?: string | null
  source: { title: string; url: string; publisher?: string | null }
}

export function parseBriefSections(sections: unknown): BriefSections | null {
  if (!sections || typeof sections !== 'object') return null
  return sections as BriefSections
}

export function briefUrgencyLabel(sections: unknown): BriefSections['urgency_label'] | undefined {
  return parseBriefSections(sections)?.urgency_label
}
