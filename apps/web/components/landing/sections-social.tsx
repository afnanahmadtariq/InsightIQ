'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Quote } from 'lucide-react'
import { Button, Card, Eyebrow } from '@/components/ui'
import { PERSONA_LIST } from '@/data/personas'
import { cn } from '@/lib/utils'

const STATS = [
  { value: '30%', label: 'of a rep’s week lost to manual prospect research' },
  { value: '<60s', label: 'to first useful facts on a new prospect' },
  { value: '2–5 min', label: 'to a complete, cited Deal Brief' },
  { value: '100%', label: 'of claims backed by a clickable citation' },
]

const TESTIMONIALS = [
  {
    quote: 'I stopped opening ten tabs before every call. InsightIQ hands me the three facts that actually matter, sourced.',
    name: 'Marcus Chen',
    role: 'Senior AE, Northwind Cloud Sales',
  },
  {
    quote: 'My clients notice when I already know what they care about. That’s the whole business.',
    name: 'Sofia Marchetti',
    role: 'Luxury Property Advisor',
  },
  {
    quote: 'As a team of one, InsightIQ is the research analyst I could never afford to hire.',
    name: 'Priya Anand',
    role: 'Fractional Growth Consultant',
  },
]

const PLANS = [
  { name: 'Solo', price: 49, credits: 40, features: ['40 research credits / mo', '1 seat', 'Standard + deep runs', 'Citation engine included'] },
  { name: 'Pro', price: 129, credits: 150, features: ['150 research credits / mo', '1 seat', 'Priority queue', 'Outreach draft templates'], highlighted: true },
  { name: 'Team', price: 299, credits: 400, features: ['400 research credits / mo', '3 seats', 'Shared workspace evidence', 'Admin & usage controls'] },
]

export function SocialSections() {
  const [activePersonaId, setActivePersonaId] = useState(PERSONA_LIST[0].id)
  const activePersona = PERSONA_LIST.find((persona) => persona.id === activePersonaId) ?? PERSONA_LIST[0]

  return (
    <>
      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="text-4xl font-bold tracking-tight text-white">{stat.value}</p>
              <p className="mt-2 text-sm leading-snug text-mist-100/55">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="personas" className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">Who it's for</Eyebrow>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
            Three sellers. One evidence-first workflow.
          </h2>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {PERSONA_LIST.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => setActivePersonaId(persona.id)}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                activePersonaId === persona.id
                  ? 'border-brand-400 bg-brand-400/15 text-white'
                  : 'border-white/15 text-mist-100/60 hover:text-white',
              )}
            >
              {persona.segment}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePersona.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="mt-10 grid gap-8 p-9 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">{activePersona.workspace.name}</p>
                <h3 className="mt-3 text-2xl font-semibold text-balance text-white">{activePersona.headline}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist-100/60">{activePersona.description}</p>
                <p className="mt-6 text-xs uppercase tracking-wide text-mist-100/40">Typical offer</p>
                <p className="mt-1 text-sm font-medium text-mist-100/80">{activePersona.offer}</p>
                <Button href="/demo" variant="primary" className="mt-7">
                  View {activePersona.user.name.split(' ')[0]}'s dashboard <ArrowRight size={16} />
                </Button>
              </div>
              <div className="grid place-content-center gap-4 rounded-2xl border border-white/10 bg-ink-950/60 p-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-400/15 text-xl font-bold text-brand-300">
                  {activePersona.user.initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{activePersona.user.name}</p>
                  <p className="text-xs text-mist-100/50">{activePersona.user.title}</p>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-mist-100/55">
                  <span className="rounded-full border border-white/15 px-2.5 py-1">{activePersona.workspace.plan} plan</span>
                  <span className="rounded-full border border-white/15 px-2.5 py-1">{activePersona.credits.balance} credits left</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">Trusted by sellers who close</Eyebrow>
            <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
              Built around real deal-prep pressure.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name} className="p-7">
                <Quote size={22} className="text-brand-400/50" />
                <p className="mt-4 text-sm leading-relaxed text-mist-100/75">"{testimonial.quote}"</p>
                <p className="mt-6 text-sm font-semibold text-white">{testimonial.name}</p>
                <p className="text-xs text-mist-100/45">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">Simple, credit-based pricing</Eyebrow>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
            One credit for a standard brief. Three for a deep refresh.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn('relative p-8', plan.highlighted && 'border-brand-400/60 bg-brand-400/[0.06] shadow-[0_30px_70px_rgba(23,143,231,0.18)]')}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <p className="text-sm font-semibold uppercase tracking-wide text-mist-100/50">{plan.name}</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-mist-100/45">/ month</span>
              </p>
              <p className="mt-1 text-xs text-mist-100/45">{plan.credits} research credits included</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-mist-100/70">
                    <Check size={16} className="mt-0.5 shrink-0 text-success-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button href="/demo" variant={plan.highlighted ? 'primary' : 'outline'} className="mt-8 w-full">
                Start with {plan.name}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <Card className="relative overflow-hidden bg-gradient-to-br from-brand-700/40 via-ink-900 to-persona-solo/20 p-14 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[100px]" />
          <h2 className="relative text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
            Stop guessing what your prospect cares about.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-mist-100/65">
            Try the interactive demo with three seeded personas — no signup, no API keys, just the flow.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button href="/demo" variant="primary" className="px-8 py-4 text-base">
              Launch the demo <ArrowRight size={18} />
            </Button>
          </div>
        </Card>
      </section>
    </>
  )
}
