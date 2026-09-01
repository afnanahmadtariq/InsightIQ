import { ArrowRight, CircleCheck, Clock3, FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { StatusBadge } from '../../components/ui/status-badge'
import { FeatureGrid, FeatureLink } from '../../components/workspace/feature-card'
import { MetricCard, MetricGrid } from '../../components/workspace/metric-card'
import { WorkspaceHeader, WorkspacePage, WorkspaceSection } from '../../components/workspace/workspace-page'
import { ItemBody, ItemIcon, ItemMeta, WorkspaceList, WorkspaceListLink } from '../../components/workspace/workspace-list'
import { formatDate } from '../../lib/format'
import type { ResearchRunSummary } from '../../lib/research'
import { authenticatedFetch, requireWorkspace } from '../../lib/server-auth'

export default async function Page() {
  const [context, runs] = await Promise.all([
    requireWorkspace(),
    authenticatedFetch<ResearchRunSummary[]>('/research-runs').then((value) => value ?? []),
  ])
  const sourceCount = runs.reduce((total, run) => total + (run._count?.sources ?? 0), 0)
  const evidenceCount = runs.reduce((total, run) => total + (run._count?.evidence ?? 0), 0)
  const briefCount = runs.filter((run) => run.brief).length
  const activeCount = runs.filter((run) => run.status === 'queued' || run.status === 'running').length

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Intelligence workspace" title={<>Good morning, {context.user.name.split(' ')[0]}.</>} lead="Research the person, connect their situation to your offer, and keep every recommendation traceable." action={<ButtonLink href="/dashboard/research/new"><Search size={17}/>New research run</ButtonLink>}/>
    <MetricGrid label="Workspace activity">
      <MetricCard icon={<Clock3 size={18}/>} value={activeCount} label="Active runs"/>
      <MetricCard icon={<Search size={18}/>} value={sourceCount} label="Public sources"/>
      <MetricCard icon={<CircleCheck size={18}/>} value={evidenceCount} label="Evidence claims"/>
      <MetricCard icon={<Sparkles size={18}/>} value={briefCount} label="Deal briefs"/>
    </MetricGrid>
    <WorkspaceSection title="Continue your research" description="The latest activity in this workspace." action={<Link href="/dashboard/research">View all</Link>}>
      {runs.length ? <WorkspaceList>{runs.slice(0, 4).map((run) => <WorkspaceListLink href={`/dashboard/research/${run.id}`} key={run.id}>
        <ItemIcon><Search size={18}/></ItemIcon><ItemBody><h3>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</h3><p>{run.offer.name} · {run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'}</p></ItemBody><ItemMeta><StatusBadge status={run.status}/><time>{formatDate(run.requestedAt, { year: undefined })}</time></ItemMeta>
      </WorkspaceListLink>)}</WorkspaceList> : <EmptyState icon={<Search size={20}/>} title="Your first signal starts here" body="Add a prospect and your offer context. InsightIQ will preserve the inputs and prepare a source-first research run." action={<Link href="/dashboard/research/new">Create a research run</Link>}/>}
    </WorkspaceSection>
    <FeatureGrid>
      <FeatureLink href="/dashboard/research" icon={<Search size={19}/>} title="Research queue" body="Launch discovery and track each run through the evidence pipeline." footer={<>Open queue <ArrowRight size={15}/></>}/>
      <FeatureLink href="/dashboard/evidence" icon={<FileCheck2 size={19}/>} title="Evidence library" body="Review collected sources and normalized claims without losing provenance." footer={<>Inspect evidence <ArrowRight size={15}/></>}/>
      <FeatureLink href="/dashboard/briefs" icon={<Sparkles size={19}/>} title="Deal briefs" body="Open meeting preparation and outreach outputs when synthesis completes." footer={<>View briefs <ArrowRight size={15}/></>}/>
    </FeatureGrid>
  </WorkspacePage>
}
