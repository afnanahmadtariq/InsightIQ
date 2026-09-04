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
    <WorkspaceHeader eyebrow="Conversation briefs" title="Ready when the prospect is." lead="Open a meeting plan or outreach draft with the strongest signal, recommended message, and proof in one place." action={<ButtonLink href="/dashboard/research/new"><Plus size={17}/>Research a prospect</ButtonLink>}/>
    <WorkspaceSection title="Ready to use" description={`${briefs.length} conversation brief${briefs.length === 1 ? '' : 's'} in this workspace.`}>
      {briefs.length ? <div className="grid grid-cols-2 gap-3 max-[680px]:grid-cols-1">{briefs.map((brief) => <Link href={`/dashboard/briefs/${brief.id}`} className="group flex min-h-[190px] flex-col rounded-[18px] border border-iq-200 bg-white p-[21px] transition hover:border-iq-300 hover:shadow-card-hover" key={brief.id}><header className="flex items-center justify-between gap-3.5"><span className="text-[.68rem] font-bold tracking-[.09em] text-brand uppercase">{brief.researchRun?.goal === 'meeting' ? 'Meeting brief' : 'Outreach brief'}</span><StatusBadge status={brief.status}/></header><h2 className="mt-6 mb-2 text-[1.2rem] tracking-[-.02em] text-iq-900">{brief.researchRun?.prospect.name}{brief.researchRun?.prospect.companyName ? ` at ${brief.researchRun.prospect.companyName}` : ''}</h2><p className="m-0 text-[.82rem] leading-[1.55] text-iq-600">Position {brief.researchRun?.offer.name} using {brief.researchRun?._count.evidence ?? 0} cited signal{brief.researchRun?._count.evidence === 1 ? '' : 's'}.</p><footer className="mt-auto flex items-center justify-between gap-3 pt-5 text-[.72rem] text-iq-500"><time>{formatDate(brief.updatedAt, { year: undefined })}</time><b className="inline-flex items-center gap-1 font-[650] text-brand">Open brief<ArrowRight className="transition-transform group-hover:translate-x-0.5" size={13}/></b></footer></Link>)}</div> : <EmptyState icon={<Sparkles size={20}/>} title="No briefs ready yet" body="Research a prospect and InsightIQ will turn verified account signals into your next conversation plan." action={<Link href="/dashboard/research/new">Research your first prospect</Link>}/>} 
    </WorkspaceSection>
  </WorkspacePage>
}
