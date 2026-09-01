import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { EmptyState, ItemBody, ItemIcon, ItemMeta, MetricCard, MetricGrid, PrimaryAction, StatusBadge, WorkspaceHeader, WorkspaceList, WorkspaceListLink, WorkspacePage, WorkspaceSection } from '../../../components/workspace-ui'
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
    <WorkspaceHeader eyebrow="Research queue" title="Your intelligence runs." lead="Move each prospect from trusted input to public sources, verified evidence, and a tailored deal brief." action={<PrimaryAction href="/dashboard/research/new"><Plus size={17}/>New research run</PrimaryAction>}/>
    <MetricGrid label="Research status summary">{Object.entries(totals).map(([status, count]) => <MetricCard key={status} icon={<Search size={18}/>} value={count} label={status}/>)}</MetricGrid>
    <WorkspaceSection title="All runs" description={`${runs.length} total across this workspace.`}>
      {runs.length ? <WorkspaceList>{runs.map((run) => <WorkspaceListLink href={`/dashboard/research/${run.id}`} key={run.id}><ItemIcon><Search size={18}/></ItemIcon><ItemBody><h2>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</h2><p>{run.offer.name} · {run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'} · {run._count?.sources ?? 0} sources</p></ItemBody><ItemMeta><StatusBadge status={run.status}/><time>{formatDate(run.requestedAt, { year: undefined })}</time></ItemMeta></WorkspaceListLink>)}</WorkspaceList> : <EmptyState icon={<Search size={20}/>} title="No research runs yet" body="Start with the prospect identifiers you trust and the offer you want to connect to their current situation." action={<Link href="/dashboard/research/new">Create your first run</Link>}/>}
    </WorkspaceSection>
  </WorkspacePage>
}
