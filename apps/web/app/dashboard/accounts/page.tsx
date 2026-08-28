'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Card, StatusBadge } from '@/components/ui'
import { usePersona } from '@/lib/persona-context'
import { runsForPersona } from '@/data/runs'
import { formatDate, initialsFromName } from '@/lib/utils'

export default function AccountsPage() {
  const { persona } = usePersona()
  const runs = runsForPersona(persona.id)

  const accountMap = new Map<string, typeof runs>()
  for (const run of runs) {
    const existing = accountMap.get(run.accountName) ?? []
    existing.push(run)
    accountMap.set(run.accountName, existing)
  }

  const accounts = [...accountMap.entries()]
    .map(([accountName, accountRuns]) => {
      const latest = [...accountRuns].sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt))[0]
      return { accountName, runs: accountRuns, latest }
    })
    .sort((a, b) => +new Date(b.latest.requestedAt) - +new Date(a.latest.requestedAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Accounts & prospects</h1>
        <p className="mt-1 text-sm text-mist-100/50">{accounts.length} accounts tracked across {runs.length} research runs.</p>
      </div>

      <Card className="max-h-[680px] overflow-y-auto scroll-thin">
        <div className="divide-y divide-white/8">
          {accounts.map(({ accountName, runs: accountRuns, latest }) => (
            <div key={accountName} className="flex items-center gap-4 px-6 py-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15 text-sm font-bold text-brand-300">
                {initialsFromName(accountName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{accountName}</p>
                  <span className="hidden items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] text-mist-100/45 sm:inline-flex">
                    <Building2 size={10} /> {accountRuns.length} run{accountRuns.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="truncate text-xs text-mist-100/50">{latest.prospectName} · {latest.prospectTitle}</p>
              </div>
              <div className="hidden text-right text-xs text-mist-100/45 sm:block">
                Last activity<br />{formatDate(latest.requestedAt)}
              </div>
              <StatusBadge status={latest.status} />
              {latest.hasBrief ? (
                <Link href={`/dashboard/runs/${latest.id}`} className="text-xs font-semibold text-brand-300 hover:text-brand-200">
                  View brief
                </Link>
              ) : (
                <span className="text-xs text-mist-100/25">No brief yet</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
