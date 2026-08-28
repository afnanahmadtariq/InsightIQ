'use client'

import Link from 'next/link'
import { ArrowRight, FileCheck2, Gauge, Radar, Sparkles, Zap } from 'lucide-react'
import { Button, Card, StatusBadge } from '@/components/ui'
import { CreditRing, MiniBarChart, StatCard } from '@/components/dashboard/widgets'
import { usePersona } from '@/lib/persona-context'
import { runsForPersona } from '@/data/runs'
import { usageHistoryForPersona } from '@/data/usage'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function DashboardOverviewPage() {
  const { persona } = usePersona()
  const runs = runsForPersona(persona.id)
  const usage = usageHistoryForPersona(persona.id)

  const completedCount = runs.filter((run) => run.status === 'completed').length
  const activeCount = runs.filter((run) => run.status === 'in_progress' || run.status === 'queued').length
  const avgConfidence = Math.round(runs.reduce((sum, run) => sum + run.matchConfidence, 0) / runs.length)
  const recentRuns = [...runs].sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt)).slice(0, 6)
  const creditsUsedThisCycle = persona.credits.monthlyAllowance - persona.credits.balance

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">Welcome back</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{persona.user.name.split(' ')[0]}'s workspace</h1>
        </div>
        <Button href="/dashboard/runs" variant="outline">
          View all runs <ArrowRight size={15} />
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Radar} label="Total research runs" value={String(runs.length)} trend="+3 this week" />
        <StatCard icon={FileCheck2} label="Completed deal briefs" value={String(completedCount)} trend="+2 this week" />
        <StatCard icon={Sparkles} label="Active / queued" value={String(activeCount)} trendPositive={false} trend={`${activeCount} in flight`} />
        <StatCard icon={Gauge} label="Avg. match confidence" value={`${avgConfidence}%`} trend="High" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent research runs</h2>
            <Link href="/dashboard/runs" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
              See all →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-white/8 overflow-hidden">
            {recentRuns.map((run) => (
              <Link
                key={run.id}
                href={run.hasBrief ? `/dashboard/runs/${run.id}` : '/dashboard/runs'}
                className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{run.accountName}</p>
                  <p className="truncate text-xs text-mist-100/50">{run.prospectName} · {run.prospectTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-mist-100/40 sm:inline">{formatRelativeTime(run.requestedAt)}</span>
                  <StatusBadge status={run.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-white">Credit usage</h2>
          <p className="text-xs text-mist-100/45">Cycle renews {formatDate(persona.credits.renewsOn)}</p>
          <div className="mt-5 flex items-center gap-6">
            <CreditRing used={creditsUsedThisCycle} total={persona.credits.monthlyAllowance} />
            <div className="space-y-2 text-xs text-mist-100/55">
              <p><span className="font-semibold text-white">{creditsUsedThisCycle}</span> used</p>
              <p><span className="font-semibold text-white">{persona.credits.balance}</span> remaining</p>
              <p><span className="font-semibold text-white">{persona.credits.monthlyAllowance}</span> allowance</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-mist-100/45">Last 14 days</p>
            <MiniBarChart values={usage.map((point) => point.creditsUsed)} labelForIndex={(i) => `${usage[i].creditsUsed} cr`} />
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15 text-brand-300">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Start a new research run</p>
            <p className="text-xs text-mist-100/50">Demo mode — live OSINT ingestion connects here once source APIs are wired up.</p>
          </div>
        </div>
        <Button variant="primary" disabled className="cursor-not-allowed opacity-60">
          New research run
        </Button>
      </Card>
    </div>
  )
}
