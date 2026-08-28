'use client'

import { Building2, Mail, ShieldCheck, Users } from 'lucide-react'
import { Card, Eyebrow } from '@/components/ui'
import { usePersona } from '@/lib/persona-context'

export default function SettingsPage() {
  const { persona } = usePersona()

  const rows = [
    { icon: Building2, label: 'Workspace name', value: persona.workspace.name },
    { icon: Users, label: 'Seats', value: `${persona.workspace.seats} seat${persona.workspace.seats > 1 ? 's' : ''} on ${persona.workspace.plan}` },
    { icon: Mail, label: 'Primary contact', value: `${persona.user.name} · ${persona.user.title}` },
    { icon: ShieldCheck, label: 'Offer context', value: persona.offer },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-mist-100/50">Workspace details for this demo persona.</p>
      </div>

      <Card className="p-2">
        <div className="divide-y divide-white/8">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-4 px-5 py-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-400/15 text-brand-300">
                <row.icon size={16} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-mist-100/40">{row.label}</p>
                <p className="mt-1 text-sm text-white">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <Eyebrow>Demo mode</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-mist-100/60">
          This workspace runs entirely on seeded, illustrative data. Source connectors, live OSINT
          workers, and account management will attach here once the backend services are connected.
        </p>
      </Card>
    </div>
  )
}
