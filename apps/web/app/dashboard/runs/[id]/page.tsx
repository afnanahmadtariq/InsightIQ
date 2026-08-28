import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Copy, HelpCircle, MessageSquareText, ShieldAlert, Sparkles } from 'lucide-react'
import { Card, CitationChip, ConfidenceBadge, Eyebrow, StatusBadge } from '@/components/ui'
import { findRun } from '@/data/runs'
import { briefForRun } from '@/data/briefs'
import { formatDate } from '@/lib/utils'

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = findRun(id)
  const brief = briefForRun(id)

  if (!run || !brief) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/dashboard/runs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-100/50 hover:text-white">
          <ArrowLeft size={14} /> Back to research runs
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>{run.id}</Eyebrow>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{brief.accountName}</h1>
            <p className="mt-1 text-sm text-mist-100/55">{brief.prospectName} · {brief.prospectTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={run.status} />
            {run.depth === 'deep' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-1 text-[0.68rem] font-semibold text-brand-300">
                <Sparkles size={11} /> Deep run
              </span>
            )}
          </div>
        </div>
      </div>

      <Card className="p-7">
        <Eyebrow>Company summary</Eyebrow>
        <p className="mt-3 text-sm leading-relaxed text-mist-100/75">{brief.companySummary}</p>
        <p className="mt-4 text-xs text-mist-100/40">
          Requested {formatDate(run.requestedAt)} · Match confidence {run.matchConfidence}%
        </p>
      </Card>

      <section>
        <Eyebrow>Signals</Eyebrow>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {brief.signals.map((signal) => (
            <Card key={signal.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-white">{signal.label}</p>
                <ConfidenceBadge level={signal.confidence} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mist-100/60">{signal.detail}</p>
              <div className="mt-3 flex gap-1.5">
                {signal.citationIds.map((citationId) => {
                  const citationIndex = brief.citations.findIndex((c) => c.id === citationId)
                  const citation = brief.citations[citationIndex]
                  if (!citation) return null
                  return <CitationChip key={citationId} index={citationIndex + 1} label={citation.label} />
                })}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Talking points</Eyebrow>
        <Card className="mt-3 p-6">
          <ul className="space-y-3">
            {brief.talkingPoints.map((point, index) => (
              <li key={index} className="flex gap-3 text-sm leading-relaxed text-mist-100/75">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[0.65rem] font-bold text-brand-300">
                  {index + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <Eyebrow>Objection handling</Eyebrow>
        <div className="mt-3 space-y-3">
          {brief.objections.map((item, index) => (
            <Card key={index} className="p-5">
              <p className="flex items-start gap-2 text-sm font-medium text-white">
                <ShieldAlert size={15} className="mt-0.5 shrink-0 text-warning-500" />
                {item.objection}
              </p>
              <p className="mt-2 pl-[1.65rem] text-sm leading-relaxed text-mist-100/65">{item.response}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Questions to ask</Eyebrow>
        <Card className="mt-3 p-6">
          <ul className="space-y-3">
            {brief.questions.map((question, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-mist-100/75">
                <HelpCircle size={15} className="mt-0.5 shrink-0 text-brand-300" />
                {question}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <Eyebrow>Outreach draft</Eyebrow>
        <Card className="mt-3 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <MessageSquareText size={16} className="text-brand-300" />
              {brief.outreachDraft.subject}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-mist-100/40">
              <Copy size={13} /> Copy
            </span>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-mist-100/70">{brief.outreachDraft.body}</p>
        </Card>
      </section>

      <section>
        <Eyebrow>Citations ({brief.citations.length})</Eyebrow>
        <Card className="mt-3 divide-y divide-white/8 p-2">
          {brief.citations.map((citation, index) => (
            <a
              key={citation.id}
              href={citation.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <CitationChip index={index + 1} label={citation.label} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{citation.label}</p>
                <p className="text-xs text-mist-100/45">
                  {citation.sourceType} · Retrieved {new Date(citation.retrievedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </a>
          ))}
        </Card>
      </section>
    </div>
  )
}
