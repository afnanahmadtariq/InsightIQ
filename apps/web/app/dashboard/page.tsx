import { ArrowRight, CircleCheck, Clock3, FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import workspace from '../../components/workspace.module.css'
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

  return <div className={workspace.page}>
    <header className={workspace.pageHeader}>
      <div><p className={workspace.eyebrow}>Intelligence workspace</p><h1>Good morning, {context.user.name.split(' ')[0]}.</h1><p className={workspace.lead}>Research the person, connect their situation to your offer, and keep every recommendation traceable.</p></div>
      <Link className={workspace.primaryLink} href="/dashboard/research/new"><Search size={17}/>New research run</Link>
    </header>
    <section className={workspace.metricGrid} aria-label="Workspace activity">
      <article className={workspace.metric}><span><Clock3 size={18}/></span><div><strong>{activeCount}</strong><small>Active runs</small></div></article>
      <article className={workspace.metric}><span><Search size={18}/></span><div><strong>{sourceCount}</strong><small>Public sources</small></div></article>
      <article className={workspace.metric}><span><CircleCheck size={18}/></span><div><strong>{evidenceCount}</strong><small>Evidence claims</small></div></article>
      <article className={workspace.metric}><span><Sparkles size={18}/></span><div><strong>{briefCount}</strong><small>Deal briefs</small></div></article>
    </section>
    <section className={workspace.section}>
      <div className={workspace.sectionHeader}><div><h2>Continue your research</h2><p>The latest activity in this workspace.</p></div><Link href="/dashboard/research">View all</Link></div>
      {runs.length ? <div className={workspace.list}>{runs.slice(0, 4).map((run) => <Link className={workspace.listItem} href={`/dashboard/research/${run.id}`} key={run.id}>
        <span className={workspace.itemIcon}><Search size={18}/></span><div className={workspace.itemBody}><h3>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</h3><p>{run.offer.name} · {run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'}</p></div><div className={workspace.itemMeta}><span className={workspace.badge} data-status={run.status}><i/>{run.status}</span><time>{formatDate(run.requestedAt, { year: undefined })}</time></div>
      </Link>)}</div> : <div className={workspace.empty}><span><Search size={20}/></span><h2>Your first signal starts here</h2><p>Add a prospect and your offer context. InsightIQ will preserve the inputs and prepare a source-first research run.</p><Link href="/dashboard/research/new">Create a research run</Link></div>}
    </section>
    <section className={workspace.cardGrid}>
      <Link href="/dashboard/research" className={workspace.featureCard}><span><Search size={19}/></span><div><h2>Research queue</h2><p>Launch discovery and track each run through the evidence pipeline.</p></div><footer>Open queue <ArrowRight size={15}/></footer></Link>
      <Link href="/dashboard/evidence" className={workspace.featureCard}><span><FileCheck2 size={19}/></span><div><h2>Evidence library</h2><p>Review collected sources and normalized claims without losing provenance.</p></div><footer>Inspect evidence <ArrowRight size={15}/></footer></Link>
      <Link href="/dashboard/briefs" className={workspace.featureCard}><span><Sparkles size={19}/></span><div><h2>Deal briefs</h2><p>Open meeting preparation and outreach outputs when synthesis completes.</p></div><footer>View briefs <ArrowRight size={15}/></footer></Link>
    </section>
  </div>
}
