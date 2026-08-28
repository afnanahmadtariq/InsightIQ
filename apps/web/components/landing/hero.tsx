'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'
import { Button, Eyebrow } from '@/components/ui'

const InsightScene = dynamic(() => import('@/components/three/insight-scene').then((mod) => mod.InsightScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-full bg-brand-600/10" />,
})

const TRUST_MARKERS = ['B2B SaaS AEs', 'High-ticket B2C agents', 'Solopreneurs & consultants']

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-28">
      <div className="pointer-events-none absolute inset-0 bg-grid-pan opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[-8%] h-[30rem] w-[30rem] rounded-full bg-persona-solo/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-xs font-semibold text-brand-300">
            <Sparkles size={14} />
            Evidence-first AI sales intelligence
          </div>

          <h1 className="mt-6 max-w-xl text-balance text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl">
            Walk into every deal already{' '}
            <em className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text font-normal not-italic text-transparent">
              knowing what matters.
            </em>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist-100/65">
            InsightIQ turns a name, email, or LinkedIn URL into a cited Deal Brief — signals, talking points,
            objection handling, and outreach drafts, every claim traceable to its raw source. No more
            hallucinated facts in front of a high-value prospect.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/demo" variant="primary" className="px-6 py-3.5 text-base">
              Launch the demo <ArrowRight size={18} />
            </Button>
            <Button href="#how-it-works" variant="outline" className="px-6 py-3.5 text-base">
              <PlayCircle size={18} /> See how it works
            </Button>
          </div>

          <div className="mt-12">
            <Eyebrow className="mb-3">Built for</Eyebrow>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_MARKERS.map((marker) => (
                <span key={marker} className="text-sm font-medium text-mist-100/55">
                  {marker}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-[560px]"
        >
          <div className="absolute inset-0 animate-pulse-ring rounded-full" />
          <InsightScene />

          <div className="absolute -left-4 top-10 animate-float-slow rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 shadow-2xl backdrop-blur-md">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-brand-300">Signal detected</p>
            <p className="mt-1 text-sm font-medium text-white">Series C raised · 11 days ago</p>
          </div>

          <div
            className="absolute -right-2 bottom-16 animate-float-slow rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 shadow-2xl backdrop-blur-md"
            style={{ animationDelay: '1.4s' }}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-success-500">Citation verified</p>
            <p className="mt-1 text-sm font-medium text-white">5 sources · 100% traceable</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
