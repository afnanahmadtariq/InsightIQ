'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Card, StatusBadge } from '@/components/ui'
import { EmptyState } from '@/components/dashboard/widgets'
import { usePersona } from '@/lib/persona-context'
import { runsForPersona, type RunStatus } from '@/data/runs'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const FILTERS: Array<{ id: RunStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'in_progress', label: 'Researching' },
  { id: 'needs_review', label: 'Needs review' },
  { id: 'queued', label: 'Queued' },
]

export default function ResearchRunsPage() {
  const { persona } = usePersona()
  const allRuns = runsForPersona(persona.id)
  const [filter, setFilter] = useState<RunStatus | 'all'>('all')

  const filteredRuns = useMemo(() => {
    const runs = filter === 'all' ? allRuns : allRuns.filter((run) => run.status === filter)
    return [...runs].sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt))
  }, [allRuns, filter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Research runs</h1>
        <p className="mt-1 text-sm text-mist-100/50">{allRuns.length} runs total for {persona.workspace.name}.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
              filter === item.id
                ? 'border-brand-400 bg-brand-400/15 text-white'
                : 'border-white/12 text-mist-100/55 hover:text-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredRuns.length === 0 ? (
        <EmptyState title="No runs match this filter" body="Try a different status filter, or queue a new research run once live ingestion is connected." />
      ) : (
        <Card className="max-h-[640px] overflow-y-auto scroll-thin">
          <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr_auto] gap-4 border-b border-white/10 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-wide text-mist-100/40 lg:grid">
            <span>Account / Prospect</span>
            <span>Requested</span>
            <span>Depth</span>
            <span>Credits</span>
            <span>Match</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-white/8">
            {filteredRuns.map((run) => (
              <Link
                key={run.id}
                href={run.hasBrief ? `/dashboard/runs/${run.id}` : '#'}
                className={cn(
                  'grid grid-cols-1 gap-2 px-6 py-4 transition-colors lg:grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr_auto] lg:items-center lg:gap-4',
                  run.hasBrief ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default opacity-90',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{run.accountName}</p>
                  <p className="truncate text-xs text-mist-100/50">{run.prospectName} · {run.prospectTitle}</p>
                </div>
                <span className="text-xs text-mist-100/55">{formatDate(run.requestedAt)}</span>
                <span className="inline-flex w-fit items-center gap-1 text-xs text-mist-100/55">
                  {run.depth === 'deep' && <Sparkles size={12} className="text-brand-300" />}
                  {run.depth === 'deep' ? 'Deep' : 'Standard'}
                </span>
                <span className="text-xs text-mist-100/55">{run.creditsCost} cr</span>
                <span className="text-xs text-mist-100/55">{run.matchConfidence}%</span>
                <div className="flex items-center justify-between gap-2 lg:justify-end">
                  <StatusBadge status={run.status} />
                  {run.hasBrief && <ChevronRight size={16} className="hidden text-mist-100/30 lg:block" />}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
