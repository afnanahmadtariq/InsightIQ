import { ArrowUpRight, FileCheck2, Search } from 'lucide-react'
import Link from 'next/link'
import libraryStyles from '../../../components/library.module.css'
import workspace from '../../../components/workspace.module.css'
import { formatConfidence, formatDate } from '../../../lib/format'
import type { EvidenceLibraryResponse } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const library = await authenticatedFetch<EvidenceLibraryResponse>('/evidence') ?? { sources: [], evidence: [] }
  const citedSources = library.sources.filter((source) => source._count.evidence > 0).length
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>Evidence library</p><h1>Trace every signal.</h1><p className={workspace.lead}>Public sources stay separate from normalized claims, so useful context never becomes a “fact” without provenance.</p></div><Link className={workspace.secondaryLink} href="/dashboard/research"><Search size={17}/>Research queue</Link></header>
    <section className={workspace.metricGrid}>
      <article className={workspace.metric}><span><Search size={18}/></span><div><strong>{library.sources.length}</strong><small>Collected sources</small></div></article>
      <article className={workspace.metric}><span><FileCheck2 size={18}/></span><div><strong>{library.evidence.length}</strong><small>Verified claims</small></div></article>
      <article className={workspace.metric}><span><ArrowUpRight size={18}/></span><div><strong>{citedSources}</strong><small>Cited sources</small></div></article>
      <article className={workspace.metric}><span><FileCheck2 size={18}/></span><div><strong>{library.sources.length - citedSources}</strong><small>Awaiting review</small></div></article>
    </section>
    <section className={workspace.section}>
      <div className={workspace.sectionHeader}><div><h2>Public source layer</h2><p>Discovery output awaiting or supporting evidence extraction.</p></div></div>
      {library.sources.length ? <div className={libraryStyles.sourceCards}>{library.sources.map((source) => <article className={libraryStyles.sourceCard} key={source.id}><header><span>{source.publisher || 'Public web'}</span><a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ArrowUpRight size={15}/></a></header><h2>{source.title}</h2>{source.excerpt && <p>{source.excerpt}</p>}<footer><div><span>{source._count.evidence} claims</span><time>{formatDate(source.retrievedAt, { year: undefined })}</time></div><Link href={`/dashboard/research/${source.researchRun.id}`}>{source.researchRun.prospect.name} · {source.researchRun.offer.name}</Link></footer></article>)}</div> : <div className={workspace.empty}><span><Search size={20}/></span><h2>No sources collected yet</h2><p>Open a queued research run and launch public-source discovery. Results will appear here across the workspace.</p><Link href="/dashboard/research">Open research queue</Link></div>}
    </section>
    <section className={workspace.section}>
      <div className={workspace.sectionHeader}><div><h2>Normalized evidence</h2><p>Claims accepted by the future evidence worker with a source and confidence score.</p></div></div>
      {library.evidence.length ? <div className={libraryStyles.claimList}>{library.evidence.map((item) => <article className={libraryStyles.claim} key={item.id}><header><span>{item.signalType}</span><strong>{formatConfidence(item.confidence)}</strong></header><p>{item.claim}</p><footer><a href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}<ArrowUpRight size={14}/></a><Link href={`/dashboard/research/${item.researchRun.id}`}>{item.researchRun.prospect.name}</Link></footer></article>)}</div> : <div className={workspace.empty}><span><FileCheck2 size={20}/></span><h2>Evidence normalization is the next build stage</h2><p>The cross-run page and tenant-safe API are ready for the worker that converts raw sources into bounded, citable claims.</p></div>}
    </section>
  </div>
}
