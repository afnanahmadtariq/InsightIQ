import Link from 'next/link'
import { Plus, Search, Sparkles } from 'lucide-react'
import { ButtonLink } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { StatusBadge } from '../../../components/ui/status-badge'
import { WorkspaceHeader, WorkspacePage, WorkspaceSection } from '../../../components/workspace/workspace-page'
import { ItemBody, ItemIcon, ItemMeta, WorkspaceList, WorkspaceListLink } from '../../../components/workspace/workspace-list'
import { formatDate } from '../../../lib/format'
import type { ResearchRunSummary } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const runs = await authenticatedFetch<ResearchRunSummary[]>('/research-runs') ?? []
  const totals = {
    queued: runs.filter((run) => run.status === 'queued').length,
    running: runs.filter((run) => run.status === 'running').length,
    completed: runs.filter((run) => run.status === 'completed').length,
    failed: runs.filter((run) => run.status === 'failed').length,
  }
  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Prospects" title="Every conversation, prepared." lead="Ready briefs open in one click. Active prospects show progress until their signals and recommendations are ready." action={<ButtonLink href="/dashboard/research/new"><Plus size={17}/>Research a prospect</ButtonLink>}/>
    <section className="flex flex-wrap gap-2" aria-label="Prospect status summary">{Object.entries(totals).map(([status, count]) => <span className="inline-flex items-center gap-2 rounded-full border border-iq-200 bg-white px-3 py-2 text-xs text-iq-600" key={status}><strong className="text-sm text-iq-900">{count}</strong><span className="capitalize">{status}</span></span>)}</section>
    <WorkspaceSection title="All prospects" description={`${runs.length} researched in this workspace.`}>
      {runs.length ? <WorkspaceList>{runs.map((run) => <WorkspaceListLink href={run.brief ? `/dashboard/briefs/${run.brief.id}` : `/dashboard/research/${run.id}`} key={run.id}>
        <ItemIcon>{run.brief ? <Sparkles size={18}/> : <Search size={18}/>}</ItemIcon>
        <ItemBody heading="h2" title={<>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</>} description={<>{run.goal === 'meeting' ? 'Meeting brief' : 'Outreach draft'} · {run.offer.name} · {run._count?.evidence ?? 0} cited signals</>}/>
        <ItemMeta><StatusBadge status={run.brief ? 'ready' : run.status}/><time>{run.brief ? 'Open brief' : formatDate(run.requestedAt, { year: undefined })}</time></ItemMeta>
      </WorkspaceListLink>)}</WorkspaceList> : <EmptyState icon={<Search size={20}/>} title="No research runs yet" body="Start with the prospect identifiers you trust and the offer you want to connect to their current situation." action={<Link href="/dashboard/research/new">Create your first run</Link>}/>} 
    </WorkspaceSection>
  </WorkspacePage>
}
