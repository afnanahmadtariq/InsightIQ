import { ArrowLeft, ArrowUpRight, FileCheck2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BriefSections } from '../../../../components/brief-sections'
import { StatusBadge } from '../../../../components/ui/status-badge'
import { WorkspaceHeader, WorkspacePage } from '../../../../components/workspace/workspace-page'
import { formatConfidence, formatDate } from '../../../../lib/format'
import type { DealBriefDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brief = await authenticatedFetch<DealBriefDetail>(`/deal-briefs/${id}`).catch(() => null)
  if (!brief) notFound()

  const prospect = brief.researchRun.prospect
  const goalLabel = brief.researchRun.goal === 'meeting' ? 'Meeting brief' : 'Outreach brief'

  return <WorkspacePage>
    <Link className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-iq-600 hover:text-brand" href="/dashboard/briefs"><ArrowLeft size={15}/>All briefs</Link>
    <WorkspaceHeader eyebrow={`${goalLabel} · Ready`} title={<>{prospect.name}{prospect.companyName ? ` at ${prospect.companyName}` : ''}</>} lead={<>Use the recommendations first. Open sources only when you need to verify or share the evidence.</>} action={<StatusBadge status={brief.status}/>}/>

    <div className="flex flex-wrap gap-2 text-xs text-iq-600">
      <MetaChip label="Offer" value={brief.researchRun.offer.name}/>
      <MetaChip label="Cited signals" value={String(brief.researchRun.evidence.length)}/>
      <MetaChip label="Updated" value={formatDate(brief.updatedAt)}/>
    </div>

    <main className="grid gap-4">
      <BriefSections sections={brief.sections} goal={brief.researchRun.goal}/>

      <details className="group overflow-hidden rounded-[18px] border border-iq-200 bg-white" data-testid="evidence-disclosure">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
          <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf8f1] text-success"><ShieldCheck size={19}/></span><span><strong className="block text-sm text-iq-900">Sources & confidence</strong><small className="mt-0.5 block text-xs text-iq-500">{brief.researchRun.evidence.length} claim{brief.researchRun.evidence.length === 1 ? '' : 's'} used in this brief</small></span></span>
          <span className="text-xs font-semibold text-brand group-open:hidden">Show evidence</span><span className="hidden text-xs font-semibold text-brand group-open:inline">Hide evidence</span>
        </summary>
        <div className="grid gap-2 border-t border-iq-100 p-4">
          {brief.researchRun.evidence.length ? brief.researchRun.evidence.map((item) => <article className="rounded-[14px] border border-iq-200 bg-iq-50/50 p-4" key={item.id}>
            <header className="mb-2 flex items-center justify-between gap-3"><span className="text-[.68rem] font-bold tracking-[.08em] text-brand uppercase">{item.signalType}</span><strong className="text-xs text-success">{formatConfidence(item.confidence)}</strong></header>
            <p className="my-0 text-sm leading-relaxed text-iq-700">{item.claim}</p>
            <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand" href={item.source.url} target="_blank" rel="noreferrer"><FileCheck2 size={14}/>{item.source.title}<ArrowUpRight size={13}/></a>
          </article>) : <p className="m-0 p-2 text-sm text-iq-500">No citations are attached to this draft yet.</p>}
        </div>
      </details>

      <Link className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-iq-600 hover:text-brand" href={`/dashboard/research/${brief.researchRun.id}`}>View research process<ArrowUpRight size={14}/></Link>
    </main>
  </WorkspacePage>
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full border border-iq-200 bg-white px-3 py-2"><span className="text-iq-500">{label}</span><strong className="ml-1.5 text-iq-900">{value}</strong></span>
}
