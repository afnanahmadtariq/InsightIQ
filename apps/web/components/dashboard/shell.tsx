'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  Building2,
  CreditCard,
  LayoutGrid,
  LogOut,
  Radar,
  Settings,
  Zap,
} from 'lucide-react'
import { usePersona } from '@/lib/persona-context'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/dashboard/runs', label: 'Research runs', icon: Radar },
  { href: '/dashboard/accounts', label: 'Accounts & prospects', icon: Building2 },
  { href: '/dashboard/billing', label: 'Billing & credits', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { persona } = usePersona()

  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900/60 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 border-b border-white/10 px-6 py-5">
          <Image src="/insightiq-logo.png" alt="InsightIQ" width={30} height={30} className="rounded-[9px]" />
          <span className="text-base font-extrabold tracking-tight text-white">InsightIQ</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-400/15 text-white'
                    : 'text-mist-100/55 hover:bg-white/5 hover:text-white',
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <Zap size={15} className="shrink-0 text-brand-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{persona.credits.balance} credits left</p>
              <p className="text-[0.68rem] text-mist-100/45">of {persona.credits.monthlyAllowance} this cycle</p>
            </div>
          </div>
          <Link
            href="/demo"
            className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-mist-100/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Switch demo user
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 px-5 py-7 sm:px-8">{children}</main>
      </div>
    </div>
  )
}

function DashboardTopbar() {
  const { persona } = usePersona()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-ink-950/80 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-mist-100/40">{persona.workspace.name}</p>
        <p className="truncate text-sm font-semibold text-white">{persona.segment}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-mist-100/60 sm:inline-flex">
          {persona.workspace.plan} plan
        </span>
        <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-400/20 text-xs font-bold text-brand-300">
            {persona.user.initials}
          </span>
          <span className="hidden text-sm font-medium text-white sm:inline">{persona.user.name}</span>
        </div>
      </div>
    </header>
  )
}
