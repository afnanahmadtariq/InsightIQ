'use client'

import { motion } from 'framer-motion'
import { Compass, FileSearch, Layers, MessageSquareText, Radar, ShieldCheck } from 'lucide-react'
import { Card, Eyebrow } from '@/components/ui'

const FEATURES = [
  {
    icon: Compass,
    title: 'Multi-faceted ingestion',
    body: "Feed InsightIQ a LinkedIn URL, an email, an X handle, or a company domain — plus what you're actually selling.",
  },
  {
    icon: Radar,
    title: 'Asynchronous OSINT',
    body: 'Parallel workers gather company news, hiring trends, and public profiles without blocking your workflow.',
  },
  {
    icon: Layers,
    title: 'Context-aware intelligence',
    body: 'Every signal is cross-referenced against your offer to surface the entry points that actually apply.',
  },
  {
    icon: FileSearch,
    title: 'Evidence-first citations',
    body: 'Every fact is a verifiable Fact or Signal — click any claim to see the raw source and retrieval time.',
  },
  {
    icon: MessageSquareText,
    title: 'Dynamic deal briefs',
    body: 'Outreach drafts, meeting prep, objection handling, and follow-up plans — generated for your specific goal.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero hallucinated facts',
    body: 'No claim ships without a source. If the evidence is thin, InsightIQ says so instead of guessing.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Submit prospect + offer',
    body: "Drop in identifiers for who you're researching and a sentence on what you're pitching.",
  },
  {
    step: '02',
    title: 'Research runs in the background',
    body: 'The UI stays unblocked. Workers resolve identity, scrape public sources, and run multi-agent synthesis.',
  },
  {
    step: '03',
    title: 'Get notified in minutes',
    body: 'A cited Deal Brief lands in your dashboard — typically within 2–5 minutes for a standard run.',
  },
  {
    step: '04',
    title: 'Verify, then close',
    body: 'Check the citations, pull the talking points, send the drafted outreach — or walk into the meeting ready.',
  },
]

export function ProductSections() {
  return (
    <>
      <section id="product" className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">What InsightIQ does</Eyebrow>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
            Research that used to take hours, delivered before your coffee's cold.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <Card className="group h-full p-7 transition-colors hover:border-brand-400/40 hover:bg-white/[0.06]">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-400/15 text-brand-300 transition-colors group-hover:bg-brand-400/25">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mist-100/60">{feature.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative border-y border-white/10 bg-white/[0.02] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">End-to-end flow</Eyebrow>
            <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
              From cold prospect to closed deal, one queued run at a time.
            </h2>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
            {STEPS.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative"
              >
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-brand-400/40 bg-ink-950 text-sm font-bold text-brand-300">
                  {item.step}
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-100/60">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>The evidence engine</Eyebrow>
            <h2 className="mt-3 text-balance text-4xl font-light tracking-tight text-white sm:text-5xl">
              Every claim clicks back to its raw source.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-mist-100/60">
              Generic AI tools hallucinate facts and cost you credibility in front of high-value clients.
              InsightIQ stores every data point as a verifiable Fact or Signal — retrieval time, source URL,
              and confidence, always attached.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-mist-100/70">
              {['Source URL and retrieval timestamp on every claim', 'Confidence scoring separates fact from inference', 'Contradictions surfaced, never silently guessed away'].map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-mist-100/45">Vertexa Analytics — signal</p>
            <p className="mt-2 text-lg font-semibold text-white">Just raised $48M Series C</p>
            <p className="mt-2 text-sm leading-relaxed text-mist-100/60">
              "Announced 11 days ago; explicitly earmarked for 'platform reliability and observability tooling.'"
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['TechCrunch coverage', 'Vertexa press release', 'Careers page — 7 open reqs'].map((source, index) => (
                <span
                  key={source}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1.5 text-xs font-medium text-brand-300"
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-400/20 text-[0.6rem] font-bold">
                    {index + 1}
                  </span>
                  {source}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-mist-100/45">
              <span>Retrieved Aug 17, 2026 · 14:02 UTC</span>
              <span className="font-semibold text-success-500">High confidence</span>
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}
