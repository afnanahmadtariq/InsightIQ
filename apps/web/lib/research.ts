export interface ResearchRunSummary {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  goal: 'outreach' | 'meeting'
  requestedAt: string
  prospect: { name: string; companyName?: string | null; email?: string | null }
  offer: { name: string; valueProposition: string }
  brief?: { id: string; title: string; status: string; updatedAt: string } | null
  _count?: { evidence: number; sources: number }
}

export interface ResearchRunDetail extends ResearchRunSummary {
  sources: Array<{ id: string; title: string; url: string; publisher?: string | null }>
  evidence: Array<{ id: string; claim: string; signalType: string; confidence: number; source: { title: string; url: string } }>
}
