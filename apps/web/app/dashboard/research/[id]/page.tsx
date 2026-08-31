import { ArrowLeft, ArrowUpRight, Check, CircleDashed, FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResearchRunActions } from '../../../../components/research-run-actions'
import styles from '../../../../components/research.module.css'
import workspace from '../../../../components/workspace.module.css'
import { formatConfidence, formatDate } from '../../../../lib/format'
import type { ResearchRunDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = await authenticatedFetch<ResearchRunDetail>(`/research-runs/${id}`).catch(() => null)
  if (!run) notFound()
  const discoveryComplete = run.sources.length > 0
  const evidenceComplete = run.evidence.length > 0
  return <div className={workspace.page}>
    <Link className={styles.breadcrumb} href="/dashboard/research"><ArrowLeft size={15}/>Research queue</Link>
    <header className={workspace.pageHeader}>
      <div><p className={workspace.eyebrow}>{run.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'}</p><h1>{run.prospect.name}</h1><p className={workspace.lead}>{run.prospect.companyName || run.prospect.email || 'Prospect research'} connected to <strong>{run.offer.name}</strong>.</p></div>
      <span className={workspace.badge} data-status={run.status}><i/>{run.status}</span>
    </header>
    <section className={styles.summary}>
      <div><small>Created</small><strong>{formatDate(run.requestedAt, { year: undefined })}</strong></div>
      <div><small>Public sources</small><strong>{run.sources.length}</strong></div>
      <div><small>Evidence claims</small><strong>{run.evidence.length}</strong></div>
      <div><small>Brief</small><strong>{run.brief ? run.brief.status : 'Pending'}</strong></div>
    </section>
    <section className={styles.workflow} aria-label="Research workflow">
      <article data-complete="true"><span><Check size={16}/></span><div><small>01</small><strong>Intake</strong><p>Identifiers and offer preserved.</p></div></article>
      <article data-complete={discoveryComplete}><span>{discoveryComplete ? <Check size={16}/> : <Search size={16}/>}</span><div><small>02</small><strong>Discovery</strong><p>{discoveryComplete ? `${run.sources.length} sources collected.` : 'Ready to search public sources.'}</p></div></article>
      <article data-complete={evidenceComplete}><span>{evidenceComplete ? <Check size={16}/> : <FileCheck2 size={16}/>}</span><div><small>03</small><strong>Evidence</strong><p>{evidenceComplete ? `${run.evidence.length} claims normalized.` : 'Normalization is the next worker stage.'}</p></div></article>
      <article data-complete={Boolean(run.brief)}><span>{run.brief ? <Check size={16}/> : <Sparkles size={16}/>}</span><div><small>04</small><strong>Brief</strong><p>{run.brief ? 'Tailored output is ready.' : 'Synthesis follows verified evidence.'}</p></div></article>
    </section>
    {run.status === 'queued' && <section className={styles.callout} data-tone="action"><div><span><Search size={19}/></span><div><h2>Ready for public-source discovery</h2><p>Launch the current Tavily discovery stage. It searches profile, company, and recent-signal queries in parallel while keeping every returned URL traceable.</p></div></div><ResearchRunActions run={run}/></section>}
    {run.status === 'running' && !discoveryComplete && <section className={styles.callout}><div><span><CircleDashed size={19}/></span><div><h2>Discovery is in progress</h2><p>The request has been claimed. Refresh to inspect sources as soon as collection finishes.</p></div></div><ResearchRunActions run={run}/></section>}
    {run.status === 'running' && discoveryComplete && <section className={styles.callout} data-tone="success"><div><span><Check size={19}/></span><div><h2>Source discovery complete</h2><p>The raw source layer is ready. Evidence normalization and deal-brief synthesis are the next implementation stages.</p></div></div></section>}
    {run.status === 'failed' && <section className={styles.callout} data-tone="error"><div><span><CircleDashed size={19}/></span><div><h2>Discovery needs attention</h2><p>{run.errorMessage || 'The provider could not complete this run. Retry after checking the project integration.'}</p></div></div><ResearchRunActions run={run}/></section>}
    <div className={workspace.split}>
      <div className={styles.detailColumn}>
        <section className={workspace.section}>
          <div className={workspace.sectionHeader}><div><h2>Collected sources</h2><p>Raw public material—useful context, not verified claims yet.</p></div><Link href="/dashboard/evidence">Evidence library</Link></div>
          {run.sources.length ? <div className={styles.sourceGrid}>{run.sources.map((source) => <article className={styles.sourceCard} key={source.id}>
            <div className={styles.sourceHead}><span>{source.publisher || 'Public web'}</span><a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ArrowUpRight size={16}/></a></div>
            <h3>{source.title}</h3>{source.excerpt && <p>{source.excerpt}</p>}<footer><span>{source.sourceType.replace(/-/g, ' ')}</span><time>{formatDate(source.publishedAt || source.retrievedAt, { year: undefined })}</time></footer>
          </article>)}</div> : <div className={workspace.empty}><span><Search size={20}/></span><h2>No public sources yet</h2><p>Start discovery above. Sources appear here before any AI-generated claim is allowed into the evidence layer.</p></div>}
        </section>
        <section className={workspace.section}>
          <div className={workspace.sectionHeader}><div><h2>Verified evidence</h2><p>Normalized claims that retain a direct source citation.</p></div></div>
          {run.evidence.length ? <div className={styles.evidenceList}>{run.evidence.map((item) => <article key={item.id}><header><span>{item.signalType}</span><strong>{formatConfidence(item.confidence)}</strong></header><p>{item.claim}</p><a href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}<ArrowUpRight size={14}/></a></article>)}</div> : <div className={workspace.empty}><span><FileCheck2 size={20}/></span><h2>Evidence normalization is next</h2><p>The source schema is ready. The next worker should extract bounded claims, assign confidence, and preserve the source relationship.</p></div>}
        </section>
      </div>
      <aside className={styles.contextCard}>
        <p>Research context</p><dl>
          <div><dt>Prospect</dt><dd>{run.prospect.name}</dd></div>
          <div><dt>Company</dt><dd>{run.prospect.companyName || 'Not supplied'}</dd></div>
          <div><dt>Offer</dt><dd>{run.offer.name}</dd></div>
          <div><dt>Target persona</dt><dd>{run.offer.targetPersona || 'Not supplied'}</dd></div>
          <div><dt>Goal</dt><dd>{run.goal === 'meeting' ? 'Prepare for a meeting' : 'Create personalized outreach'}</dd></div>
        </dl>
        <div><small>Value proposition</small><p>{run.offer.valueProposition}</p></div>
        {run.brief && <Link className={workspace.primaryLink} href={`/dashboard/briefs/${run.brief.id}`}>Open deal brief<ArrowUpRight size={16}/></Link>}
      </aside>
    </div>
  </div>
}
