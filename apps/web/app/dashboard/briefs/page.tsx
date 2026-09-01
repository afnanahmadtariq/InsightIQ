import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { StatusBadge } from '../../../components/ui/status-badge'
import { WorkspaceHeader, WorkspacePage, WorkspaceSection } from '../../../components/workspace/workspace-page'
import { formatDate } from '../../../lib/format'
import type { DealBriefSummary } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const briefs = await authenticatedFetch<DealBriefSummary[]>('/deal-briefs') ?? []
  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Deal briefs" title="From evidence to action." lead="Meeting preparation and outreach drafts belong here only after every supporting claim can point back to a public source." action={<ButtonLink href="/dashboard/research/new"><Plus size={17}/>New research run</ButtonLink>}/>
    <WorkspaceSection title="Generated briefs" description={`${briefs.length} tailored outputs in this workspace.`}>
      {briefs.length ? <div className="grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">{briefs.map((brief) => <Link href={`/dashboard/briefs/${brief.id}`} className="flex min-h-[210px] flex-col rounded-2xl border border-iq-200 bg-white p-[21px]" key={brief.id}><header className="flex items-center justify-between gap-3.5"><StatusBadge status={brief.status}/><Sparkles size={18}/></header><h2 className="mt-[25px] mb-2 text-[1.08rem] text-iq-900">{brief.title}</h2><p className="m-0 text-[.83rem] leading-[1.55] text-iq-600">{brief.researchRun?.prospect.name}{brief.researchRun?.prospect.companyName ? ` · ${brief.researchRun.prospect.companyName}` : ''} connected to {brief.researchRun?.offer.name}.</p><footer className="mt-auto flex items-center justify-between gap-3 pt-5 text-[.7rem] text-iq-500"><span className="flex gap-3"><span>{brief.researchRun?._count.sources ?? 0} sources</span><span>{brief.researchRun?._count.evidence ?? 0} claims</span></span><b className="inline-flex items-center gap-1 font-[650] text-brand">{formatDate(brief.updatedAt, { year: undefined })}<ArrowRight size={13}/></b></footer></Link>)}</div> : <EmptyState icon={<Sparkles size={20}/>} title="No deal briefs yet" body="Brief synthesis follows source discovery and evidence normalization. The page is ready for dynamic meeting and outreach sections." action={<Link href="/dashboard/research">Review research runs</Link>}/>}
    </WorkspaceSection>
  </WorkspacePage>
}
