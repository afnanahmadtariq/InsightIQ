'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Building2, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { PERSONA_LIST } from '@/data/personas'
import { usePersona } from '@/lib/persona-context'
import { cn } from '@/lib/utils'

const PERSONA_ICONS = { 'b2b-saas': Building2, 'b2c-luxury': Briefcase, solopreneur: UserRound } as const

export default function DemoPage() {
  const router = useRouter()
  const { personaId, setPersonaId } = usePersona()

  function selectAndEnter(id: (typeof PERSONA_LIST)[number]['id']) {
    setPersonaId(id)
    router.push('/dashboard')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 px-6 py-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-pan opacity-[0.25]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <Image src="/insightiq-logo.png" alt="InsightIQ" width={34} height={34} className="rounded-[10px]" />
          <span className="text-lg font-extrabold tracking-tight text-white">InsightIQ</span>
        </Link>

        <div className="mx-auto mt-10 max-w-xl text-center">
          <h1 className="text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
            Pick a seat, see the workflow.
          </h1>
          <p className="mt-4 text-mist-100/60">
            No sign-up needed. Choose one of three seeded demo workspaces — each with real-looking,
            fully fictional deal briefs already generated.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PERSONA_LIST.map((persona, index) => {
            const Icon = PERSONA_ICONS[persona.id]
            const isActive = personaId === persona.id
            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card
                  className={cn(
                    'group flex h-full cursor-pointer flex-col p-7 transition-all hover:-translate-y-1 hover:border-brand-400/50 hover:bg-white/[0.06]',
                    isActive && 'border-brand-400/60 bg-brand-400/[0.06]',
                  )}
                >
                  <button type="button" onClick={() => selectAndEnter(persona.id)} className="flex h-full flex-col text-left">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-400/15 text-brand-300">
                      <Icon size={22} />
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-mist-100/45">
                      {persona.segment}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-400/20 text-sm font-bold text-brand-300">
                        {persona.user.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{persona.user.name}</p>
                        <p className="text-xs text-mist-100/50">{persona.user.title}</p>
                      </div>
                    </div>
                    <p className="mt-5 flex-1 text-sm leading-relaxed text-mist-100/60">{persona.description}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-mist-100/50">
                      <span>{persona.workspace.plan} plan · {persona.credits.balance} credits</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-300 transition-transform group-hover:translate-x-0.5">
                        Enter <ArrowRight size={13} />
                      </span>
                    </div>
                  </button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
