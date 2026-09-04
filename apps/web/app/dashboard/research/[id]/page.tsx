import { ArrowLeft, ArrowUpRight, Check, CircleDashed, FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ResearchRunActions } from '../../../../components/research-run-actions'
import { ResearchRunPoller } from '../../../../components/research-run-poller'
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
  const showProgress = run.status !== 'completed' || !run.brief

  return <WorkspacePage>
    <ResearchRunPoller status={run.status} hasBrief={Boolean(run.brief)}/>
    <Link className="inline-flex w-fit items-center gap-[7px] text-[.81rem] font-semibold text-iq-600 transition-colors duration-300 ease-fluid hover:text-brand motion-reduce:transition-none" href="/dashboard/research"><ArrowLeft size={15}/>Prospects</Link>
    <WorkspaceHeader eyebrow={run.goal === 'meeting' ? 'Meeting brief' : 'Outreach brief'} title={run.prospect.name} lead={<>{run.prospect.companyName || run.prospect.email || 'Prospect research'} · Positioning <strong>{run.offer.name}</strong>.</>} action={<StatusBadge status={run.status}/>}/>

    {showProgress && <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-iq-200 bg-iq-200 sm:grid-cols-2 lg:grid-cols-4">
      <RunMetric label="Created" value={formatDate(run.requestedAt, { year: undefined })}/>
      <RunMetric label="Public sources" value={run.sources.length}/>
      <RunMetric label="Evidence claims" value={run.evidence.length}/>
      <RunMetric label="Brief" value={run.brief ? run.brief.status : 'Pending'}/>
    </section>}

    {showProgress && <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[950px]:grid-cols-4" aria-label="Research workflow">
      <WorkflowStep number="01" title="Input" description="Prospect and offer saved." complete icon={<Check size={16}/>}/>
      <WorkflowStep number="02" title="Web research" description={discoveryComplete ? `${run.sources.length} sources found.` : 'Searching trusted public sources.'} complete={discoveryComplete} icon={discoveryComplete ? <Check size={16}/> : <Search size={16}/>}/>
      <WorkflowStep number="03" title="Signal check" description={evidenceComplete ? `${run.evidence.length} claims verified.` : discoveryComplete ? 'Checking relevance and citations.' : 'Starts after web research.'} complete={evidenceComplete} icon={evidenceComplete ? <Check size={16}/> : <FileCheck2 size={16}/>}/>
      <WorkflowStep number="04" title="Conversation brief" description={run.brief ? 'Ready to use.' : evidenceComplete ? 'Turning signals into recommendations.' : 'Built from verified signals.'} complete={Boolean(run.brief)} icon={run.brief ? <Check size={16}/> : <Sparkles size={16}/>}/>
    </section>}

    {run.status === 'queued' && <ResearchCallout icon={<Search size={19}/>} title="Ready for public-source discovery" body="Launch the current Tavily discovery stage. It searches profile, company, and recent-signal queries in parallel while keeping every returned URL traceable."><ResearchRunActions run={run}/></ResearchCallout>}
    {run.status === 'running' && !discoveryComplete && <ResearchCallout icon={<CircleDashed size={19}/>} title="Discovery is in progress" body="The request has been claimed. Refresh to inspect sources as soon as collection finishes."><ResearchRunActions run={run}/></ResearchCallout>}
    {run.status === 'running' && discoveryComplete && !run.brief && <ResearchCallout tone="success" icon={<CircleDashed size={19}/>} title="Worker is synthesizing your brief" body="Sources are collected. The Python worker is extracting citable claims and generating your deal brief — this page refreshes automatically."><ResearchRunActions run={run}/></ResearchCallout>}
    {run.status === 'running' && discoveryComplete && run.brief && <ResearchCallout tone="success" icon={<Check size={19}/>} title="Deal brief ready" body="Your cited brief is ready to review."><ButtonLink href={`/dashboard/briefs/${run.brief.id}`}>Open deal brief<ArrowUpRight size={16}/></ButtonLink></ResearchCallout>}
    {run.status === 'completed' && run.brief && <ResearchCallout tone="success" icon={<Check size={19}/>} title="Your conversation brief is ready" body={`${run.evidence.length} cited signal${run.evidence.length === 1 ? '' : 's'} shaped the recommended opener, questions, and next step.`}><ButtonLink href={`/dashboard/briefs/${run.brief.id}`}>Use this brief<ArrowUpRight size={16}/></ButtonLink></ResearchCallout>}
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
          {run.evidence.length ? <div className="grid gap-[9px]">{run.evidence.map((item) => <article className="rounded-[14px] border border-iq-200 bg-white p-[18px]" key={item.id}><header className="flex items-center justify-between gap-3 text-[.7rem] font-[650] tracking-[.05em] text-brand uppercase"><span>{item.signalType}</span><strong className="text-[.68rem] text-success">{formatConfidence(item.confidence)}</strong></header><p className="my-3 text-[.87rem] leading-[1.6] text-iq-700">{item.claim}</p><a className="inline-flex items-center gap-[5px] text-[.74rem] font-[650] text-brand" href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}<ArrowUpRight size={14}/></a></article>)}</div> : <EmptyState icon={<FileCheck2 size={20}/>} title={discoveryComplete ? 'Extracting verified claims' : 'Evidence follows discovery'} body={discoveryComplete ? 'The worker is reading collected sources and normalizing citable claims with confidence scores.' : 'Start discovery above. Claims appear here once the worker extracts them from collected sources.'}/>}
        </WorkspaceSection>
      </div>

      <aside className="sticky top-24 rounded-2xl border border-iq-200 bg-white p-5 max-[950px]:static">
        <p className="mt-0 mb-[17px] text-[.91rem] font-bold text-iq-900">Research context</p>
        <dl className="mt-0 mb-[18px] grid">
          <ContextRow label="Prospect" value={run.prospect.name}/><ContextRow label="Company" value={run.prospect.companyName || 'Not supplied'}/><ContextRow label="Offer" value={run.offer.name}/><ContextRow label="Target persona" value={run.offer.targetPersona || 'Not supplied'}/><ContextRow label="Goal" value={run.goal === 'meeting' ? 'Prepare for a meeting' : 'Create personalized outreach'}/>
        </dl>
        <div><small className="text-[.66rem] tracking-[.07em] text-iq-500 uppercase">Value proposition</small><p className="mt-[7px] mb-[18px] text-[.78rem] leading-[1.55] text-iq-600">{run.offer.valueProposition}</p></div>
        {run.brief && run.status !== 'completed' && <ButtonLink href={`/dashboard/briefs/${run.brief.id}`}>Open conversation brief<ArrowUpRight size={16}/></ButtonLink>}
      </aside>
    </WorkspaceSplit>
  </WorkspacePage>
}

function RunMetric({ label, value }: { label: string; value: ReactNode }) {
  return <div className="bg-white p-[18px]"><small className="mb-2 block text-[.68rem] tracking-wider text-iq-500 uppercase">{label}</small><strong className="text-sm text-iq-900 capitalize">{value}</strong></div>
}

function WorkflowStep({ number, title, description, complete, icon }: { number: string; title: string; description: string; complete: boolean; icon: ReactNode }) {
  return <article className="flex min-h-[125px] gap-3 rounded-[15px] border border-iq-200 bg-white/70 p-4"><span className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${complete ? 'bg-[#eaf8f1] text-success' : 'bg-[#f1f4f9] text-iq-500'}`}>{icon}</span><div><small className="text-[.62rem] tracking-wider text-iq-500">{number}</small><strong className="mt-1 mb-1 block text-sm text-iq-900">{title}</strong><p className="m-0 text-xs leading-normal text-iq-500">{description}</p></div></article>
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-b border-iq-100 py-3"><dt className="text-[.66rem] tracking-wider text-iq-500 uppercase">{label}</dt><dd className="m-0 text-sm leading-normal text-iq-900">{value}</dd></div>
}
