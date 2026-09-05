'use client'

import { parseBriefSections, type BriefSections } from '../lib/brief'
import { CopyButton } from './ui/copy-button'

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function formatConversationPack(sections: unknown, goal: 'meeting' | 'outreach') {
  const brief = parseBriefSections(sections)
  if (!brief) return ''

  const lines: string[] = []
  const citations = brief.key_signals ?? []
  const footnotes = new Map<string, number>()
  citations.forEach((citation, index) => footnotes.set(citation.evidence_id, index + 1))

  const summary = text(brief.summary)
  if (summary) lines.push('SUMMARY', summary, '')

  const opener = text(brief.personalized_opener)
  if (opener) lines.push('OPENER', opener, '')

  const talkingPoints = list(brief.talking_points)
  if (talkingPoints.length) {
    lines.push('TALKING POINTS')
    talkingPoints.forEach((item, index) => lines.push(`${index + 1}. ${item}`))
    lines.push('')
  }

  if (goal === 'meeting') {
    const questions = list(brief.questions_to_ask)
    if (questions.length) {
      lines.push('QUESTIONS TO ASK')
      questions.forEach((item, index) => lines.push(`${index + 1}. ${item}`))
      lines.push('')
    }
  }

  const nextSteps = list(brief.next_steps)
  if (nextSteps.length) {
    lines.push('NEXT STEPS')
    nextSteps.forEach((item, index) => lines.push(`${index + 1}. ${item}`))
    lines.push('')
  }

  if (citations.length) {
    lines.push('CITATIONS')
    citations.forEach((citation) => {
      const number = footnotes.get(citation.evidence_id)
      lines.push(`[${number}] ${citation.claim} (${citation.signal_type}) — ${citation.source_url}`)
    })
  }

  return lines.join('\n').trim()
}

export function ConversationPackButton({ sections, goal }: { sections: unknown; goal: 'meeting' | 'outreach' }) {
  const value = formatConversationPack(sections, goal)
  if (!value) return null
  return <CopyButton value={value} label="Copy for CRM"/>
}

export function extractBriefDiff(previous: unknown, current: unknown): Array<{ field: string; before: string; after: string }> {
  const prev = parseBriefSections(previous)
  const next = parseBriefSections(current)
  if (!prev || !next) return []

  const fields: Array<{ field: string; key: keyof BriefSections }> = [
    { field: 'Summary', key: 'summary' },
    { field: 'Opener', key: 'personalized_opener' },
    { field: 'Talking points', key: 'talking_points' },
  ]

  return fields.flatMap(({ field, key }) => {
    const before = key === 'talking_points' ? list(prev[key]).join('\n') : text(prev[key]) || ''
    const after = key === 'talking_points' ? list(next[key]).join('\n') : text(next[key]) || ''
    if (before === after) return []
    return [{ field, before, after }]
  })
}
