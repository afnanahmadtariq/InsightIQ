import { ArrowLeft, ArrowUpRight, Check, CircleDashed, FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ResearchRunActions } from '../../../../components/research-run-actions'
import { ButtonLink } from '../../../../components/ui/button'
import { EmptyState } from '../../../../components/ui/empty-state'
import { StatusBadge } from '../../../../components/ui/status-badge'
import { WorkspaceHeader, WorkspacePage, WorkspaceSection, WorkspaceSplit } from '../../../../components/workspace/workspace-page'
import { formatConfidence, formatDate } from '../../../../lib/format'
import type { ResearchRunDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

function ResearchCallout({ tone, icon, title, body, children }: { tone?: 'success' | 'error'; icon: ReactNode; title: string; body: ReactNode; children?: ReactNode }) {
  return <section className="flex items-center justify-between gap-6 rounded-2xl border border-iq-200 bg-white p-5 max-[700px]:flex-col max-[700px]:items-start data-[tone=success]:border-[#ccebdc] data-[tone=success]:bg-[#f7fcf9] data-[tone=error]:border-[#f0cbd1] data-[tone=error]:bg-[#fffafb]" data-tone={tone}>
    <div className="flex items-start gap-[13px]"><span className={`grid size-9 shrink-0 place-items-center rounded-[11px] ${tone === 'success' ? 'bg-[#e2f6ec] text-success' : tone === 'error' ? 'bg-[#fff0f2] text-danger' : 'bg-iq-100 text-brand'}`}>{icon}</span><div><h2 className="mt-0 mb-[5px] text-[.98rem] text-iq-900">{title}</h2><p className="m-0 max-w-[680px] text-[.82rem] leading-[1.55] text-iq-600">{body}</p></div></div>
    {children}
  </section>
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = await authenticatedFetch<ResearchRunDetail>(`/research-runs/${id}`).catch(() => null)
  if (!run) notFound()
  const discoveryComplete = run.sources.length > 0
  const evidenceComplete = run.evidence.length > 0

  return <WorkspacePage>
    <Link className="inline-flex w-fit items-center gap-[7px] text-[.81rem] font-semibold text-iq-600 transition-colors duration-300 ease-fluid hover:text-brand motion-reduce:transition-none" href="/dashboard/research"><ArrowLeft size={15}/>Research queue</Link>
    <WorkspaceHeader eyebrow={run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'} title={run.prospect.name} lead={<>{run.prospect.companyName || run.prospect.email || 'Prospect research'} connected to <strong>{run.offer.name}</strong>.</>} action={<StatusBadge status={run.status}/>}/>

    <section className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-iq-200 bg-iq-200 max-[700px]:grid-cols-1 max-[700px]:gap-0 [&>div]:bg-white [&>div]:p-[18px] max-[700px]:[&>div]:border-b max-[700px]:[&>div]:border-iq-200 [&_small]:mb-[7px] [&_small]:block [&_small]:text-[.68rem] [&_small]:tracking-[.08em] [&_small]:text-iq-500 [&_small]:uppercase [&_strong]:text-[.9rem] [&_strong]:text-iq-900 [&_strong]:capitalize">
      <div><small>Created</small><strong>{formatDate(run.requestedAt, { year: undefined })}</strong></div>
      <div><small>Public sources</small><strong>{run.sources.length}</strong></div>
      <div><small>Evidence claims</small><strong>{run.evidence.length}</strong></div>
      <div><small>Brief</small><strong>{run.brief ? run.brief.status : 'Pending'}</strong></div>
    </section>

    <section className="grid grid-cols-4 gap-[11px] max-[950px]:grid-cols-2 max-[700px]:grid-cols-1 [&>article]:flex [&>article]:min-h-[125px] [&>article]:gap-[11px] [&>article]:rounded-[15px] [&>article]:border [&>article]:border-iq-200 [&>article]:bg-white/68 [&>article]:p-[17px] [&>article>span]:grid [&>article>span]:size-[31px] [&>article>span]:shrink-0 [&>article>span]:place-items-center [&>article>span]:rounded-[10px] [&>article>span]:bg-[#f1f4f9] [&>article>span]:text-iq-500 [&>article[data-complete=true]>span]:bg-[#eaf8f1] [&>article[data-complete=true]>span]:text-success [&_small]:text-[.62rem] [&_small]:tracking-[.08em] [&_small]:text-iq-500 [&_strong]:mt-[3px] [&_strong]:mb-[5px] [&_strong]:block [&_strong]:text-[.84rem] [&_strong]:text-iq-900 [&_p]:m-0 [&_p]:text-[.72rem] [&_p]:leading-[1.45] [&_p]:text-iq-500" aria-label="Research workflow">
      <article data-complete="true"><span><Check size={16}/></span><div><small>01</small><strong>Intake</strong><p>Identifiers and offer preserved.</p></div></article>
      <article data-complete={discoveryComplete}><span>{discoveryComplete ? <Check size={16}/> : <Search size={16}/>}</span><div><small>02</small><strong>Discovery</strong><p>{discoveryComplete ? `${run.sources.length} sources collected.` : 'Ready to search public sources.'}</p></div></article>
      <article data-complete={evidenceComplete}><span>{evidenceComplete ? <Check size={16}/> : <FileCheck2 size={16}/>}</span><div><small>03</small><strong>Evidence</strong><p>{evidenceComplete ? `${run.evidence.length} claims normalized.` : 'Normalization is the next worker stage.'}</p></div></article>
      <article data-complete={Boolean(run.brief)}><span>{run.brief ? <Check size={16}/> : <Sparkles size={16}/>}</span><div><small>04</small><strong>Brief</strong><p>{run.brief ? 'Tailored output is ready.' : 'Synthesis follows verified evidence.'}</p></div></article>
    </section>

    {run.status === 'queued' && <ResearchCallout icon={<Search size={19}/>} title="Ready for public-source discovery" body="Launch the current Tavily discovery stage. It searches profile, company, and recent-signal queries in parallel while keeping every returned URL traceable."><ResearchRunActions run={run}/></ResearchCallout>}
    {run.status === 'running' && !discoveryComplete && <ResearchCallout icon={<CircleDashed size={19}/>} title="Discovery is in progress" body="The request has been claimed. Refresh to inspect sources as soon as collection finishes."><ResearchRunActions run={run}/></ResearchCallout>}
    {run.status === 'running' && discoveryComplete && <ResearchCallout tone="success" icon={<Check size={19}/>} title="Source discovery complete" body="The raw source layer is ready. Evidence normalization and deal-brief synthesis are the next implementation stages."/>}
    {run.status === 'failed' && <ResearchCallout tone="error" icon={<CircleDashed size={19}/>} title="Discovery needs attention" body={run.errorMessage || 'The provider could not complete this run. Retry after checking the project integration.'}><ResearchRunActions run={run}/></ResearchCallout>}

    <WorkspaceSplit>
      <div className="grid gap-7">
        <WorkspaceSection title="Collected sources" description="Raw public material—useful context, not verified claims yet." action={<Link href="/dashboard/evidence">Evidence library</Link>}>
          {run.sources.length ? <div className="grid grid-cols-2 gap-2.5 max-[700px]:grid-cols-1">{run.sources.map((source) => <article className="flex min-w-0 flex-col rounded-[15px] border border-iq-200 bg-white p-[18px]" key={source.id}>
            <div className="flex items-center justify-between gap-3 text-[.68rem] font-[650] tracking-[.06em] text-brand uppercase"><span className="truncate">{source.publisher || 'Public web'}</span><a className="grid size-[29px] shrink-0 place-items-center rounded-lg bg-iq-100" href={source.url} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ArrowUpRight size={16}/></a></div>
            <h3 className="mt-[15px] mb-2 text-[.92rem] leading-[1.35] text-iq-900">{source.title}</h3>{source.excerpt && <p className="mb-[18px] line-clamp-4 text-[.78rem] leading-[1.55] text-iq-600">{source.excerpt}</p>}<footer className="mt-auto flex items-center justify-between gap-2.5 border-t border-iq-100 pt-[13px] text-[.66rem] text-iq-500 capitalize"><span>{source.sourceType.replace(/-/g, ' ')}</span><time>{formatDate(source.publishedAt || source.retrievedAt, { year: undefined })}</time></footer>
          </article>)}</div> : <EmptyState icon={<Search size={20}/>} title="No public sources yet" body="Start discovery above. Sources appear here before any AI-generated claim is allowed into the evidence layer."/>}
        </WorkspaceSection>

        <WorkspaceSection title="Verified evidence" description="Normalized claims that retain a direct source citation.">
          {run.evidence.length ? <div className="grid gap-[9px]">{run.evidence.map((item) => <article className="rounded-[14px] border border-iq-200 bg-white p-[18px]" key={item.id}><header className="flex items-center justify-between gap-3 text-[.7rem] font-[650] tracking-[.05em] text-brand uppercase"><span>{item.signalType}</span><strong className="text-[.68rem] text-success">{formatConfidence(item.confidence)}</strong></header><p className="my-3 text-[.87rem] leading-[1.6] text-iq-700">{item.claim}</p><a className="inline-flex items-center gap-[5px] text-[.74rem] font-[650] text-brand" href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}<ArrowUpRight size={14}/></a></article>)}</div> : <EmptyState icon={<FileCheck2 size={20}/>} title="Evidence normalization is next" body="The source schema is ready. The next worker should extract bounded claims, assign confidence, and preserve the source relationship."/>}
        </WorkspaceSection>
      </div>

      <aside className="sticky top-24 rounded-2xl border border-iq-200 bg-white p-5 max-[950px]:static">
        <p className="mt-0 mb-[17px] text-[.91rem] font-bold text-iq-900">Research context</p>
        <dl className="mt-0 mb-[18px] grid [&>div]:grid [&>div]:gap-[3px] [&>div]:border-b [&>div]:border-iq-100 [&>div]:py-[11px] [&_dt]:text-[.66rem] [&_dt]:tracking-[.07em] [&_dt]:text-iq-500 [&_dt]:uppercase [&_dd]:m-0 [&_dd]:text-[.82rem] [&_dd]:leading-[1.4] [&_dd]:text-iq-900">
          <div><dt>Prospect</dt><dd>{run.prospect.name}</dd></div><div><dt>Company</dt><dd>{run.prospect.companyName || 'Not supplied'}</dd></div><div><dt>Offer</dt><dd>{run.offer.name}</dd></div><div><dt>Target persona</dt><dd>{run.offer.targetPersona || 'Not supplied'}</dd></div><div><dt>Goal</dt><dd>{run.goal === 'meeting' ? 'Prepare for a meeting' : 'Create personalized outreach'}</dd></div>
        </dl>
        <div><small className="text-[.66rem] tracking-[.07em] text-iq-500 uppercase">Value proposition</small><p className="mt-[7px] mb-[18px] text-[.78rem] leading-[1.55] text-iq-600">{run.offer.valueProposition}</p></div>
        {run.brief && <ButtonLink href={`/dashboard/briefs/${run.brief.id}`}>Open deal brief<ArrowUpRight size={16}/></ButtonLink>}
      </aside>
    </WorkspaceSplit>
  </WorkspacePage>
}
