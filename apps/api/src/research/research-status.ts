export const RESEARCH_STATUSES = ['queued', 'running', 'completed', 'failed'] as const
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number]

const transitions: Record<ResearchStatus, ResearchStatus[]> = {
  queued: ['running', 'failed'],
  running: ['completed', 'failed'],
  completed: [],
  failed: ['queued'],
}

export function canTransitionResearchStatus(from: ResearchStatus, to: ResearchStatus) {
  return transitions[from].includes(to)
}
