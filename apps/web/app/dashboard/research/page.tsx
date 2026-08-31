import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import workspace from '../../../components/workspace.module.css'
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
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>Research queue</p><h1>Your intelligence runs.</h1><p className={workspace.lead}>Move each prospect from trusted input to public sources, verified evidence, and a tailored deal brief.</p></div><Link className={workspace.primaryLink} href="/dashboard/research/new"><Plus size={17}/>New research run</Link></header>
    <section className={workspace.metricGrid} aria-label="Research status summary">
      {Object.entries(totals).map(([status, count]) => <article className={workspace.metric} key={status}><span><Search size={18}/></span><div><strong>{count}</strong><small>{status}</small></div></article>)}
    </section>
    <section className={workspace.section}>
      <div className={workspace.sectionHeader}><div><h2>All runs</h2><p>{runs.length} total across this workspace.</p></div></div>
      {runs.length ? <div className={workspace.list}>{runs.map((run) => <Link className={workspace.listItem} href={`/dashboard/research/${run.id}`} key={run.id}><span className={workspace.itemIcon}><Search size={18}/></span><div className={workspace.itemBody}><h2>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</h2><p>{run.offer.name} · {run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'} · {run._count?.sources ?? 0} sources</p></div><div className={workspace.itemMeta}><span className={workspace.badge} data-status={run.status}><i/>{run.status}</span><time>{formatDate(run.requestedAt, { year: undefined })}</time></div></Link>)}</div> : <div className={workspace.empty}><span><Search size={20}/></span><h2>No research runs yet</h2><p>Start with the prospect identifiers you trust and the offer you want to connect to their current situation.</p><Link href="/dashboard/research/new">Create your first run</Link></div>}
    </section>
  </div>
}
