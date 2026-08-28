'use client'

import { Check, Download } from 'lucide-react'
import { Button, Card, Eyebrow } from '@/components/ui'
import { CreditRing, MiniBarChart } from '@/components/dashboard/widgets'
import { usePersona } from '@/lib/persona-context'
import { usageHistoryForPersona, invoicesForPersona } from '@/data/usage'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function BillingPage() {
  const { persona } = usePersona()
  const usage = usageHistoryForPersona(persona.id)
  const invoices = invoicesForPersona(persona.id)
  const creditsUsedThisCycle = persona.credits.monthlyAllowance - persona.credits.balance

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Billing & credits</h1>
        <p className="mt-1 text-sm text-mist-100/50">{persona.workspace.name} · {persona.workspace.plan} plan</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Card className="p-6">
          <Eyebrow>Current cycle</Eyebrow>
          <div className="mt-4 flex items-center gap-6">
            <CreditRing used={creditsUsedThisCycle} total={persona.credits.monthlyAllowance} />
            <div className="space-y-2 text-xs text-mist-100/55">
              <p><span className="font-semibold text-white">{creditsUsedThisCycle}</span> credits used</p>
              <p><span className="font-semibold text-white">{persona.credits.balance}</span> remaining</p>
              <p>Renews {formatDate(persona.credits.renewsOn)}</p>
            </div>
          </div>
          <Button variant="outline" className="mt-6 w-full">Manage plan</Button>
        </Card>

        <Card className="p-6">
          <Eyebrow>Daily credit usage — last 14 days</Eyebrow>
          <div className="mt-5">
            <MiniBarChart values={usage.map((point) => point.creditsUsed)} labelForIndex={(i) => `${usage[i].creditsUsed} cr · ${formatDate(usage[i].date)}`} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Eyebrow>Plan comparison</Eyebrow>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { name: 'Solo', price: 49, credits: 40, seats: 1 },
            { name: 'Pro', price: 129, credits: 150, seats: 1 },
            { name: 'Team', price: 299, credits: 400, seats: 3 },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-5 ${plan.name === persona.workspace.plan ? 'border-brand-400/60 bg-brand-400/[0.06]' : 'border-white/10'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                {plan.name === persona.workspace.plan && (
                  <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-success-500">
                    <Check size={12} /> Current
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(plan.price)}<span className="text-xs font-normal text-mist-100/45">/mo</span></p>
              <p className="mt-1 text-xs text-mist-100/50">{plan.credits} credits · {plan.seats} seat{plan.seats > 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between px-4 py-3">
          <Eyebrow>Invoice history</Eyebrow>
        </div>
        <div className="divide-y divide-white/8">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-white">{invoice.period}</p>
                <p className="text-xs text-mist-100/45">{invoice.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-mist-100/70">{formatCurrency(invoice.amountUsd)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${invoice.status === 'Paid' ? 'bg-success-500/15 text-success-500' : 'bg-white/10 text-mist-100/60'}`}
                >
                  {invoice.status}
                </span>
                <Download size={14} className="text-mist-100/35" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
