import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive = true,
}: {
  icon: LucideIcon
  label: string
  value: string
  trend?: string
  trendPositive?: boolean
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15 text-brand-300">
          <Icon size={18} />
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold', trendPositive ? 'text-success-500' : 'text-danger-500')}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-mist-100/50">{label}</p>
    </Card>
  )
}

export function MiniBarChart({ values, labelForIndex }: { values: number[]; labelForIndex?: (index: number) => string }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-32 items-end gap-1.5">
      {values.map((value, index) => (
        <div key={index} className="group relative flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-brand-700 to-brand-300 transition-opacity group-hover:opacity-80"
            style={{ height: `${Math.max((value / max) * 100, 4)}%` }}
          />
          {labelForIndex && (
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-[0.6rem] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {labelForIndex(index)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function CreditRing({ used, total }: { used: number; total: number }) {
  const percentUsed = Math.min(Math.round((used / total) * 100), 100)
  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--color-brand-400) ${percentUsed * 3.6}deg, color-mix(in srgb, white 8%, transparent) 0deg)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-ink-950" />
      <div className="relative text-center">
        <p className="text-xl font-bold text-white">{percentUsed}%</p>
        <p className="text-[0.6rem] text-mist-100/45">used</p>
      </div>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 p-14 text-center">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="max-w-sm text-sm text-mist-100/50">{body}</p>
    </Card>
  )
}
