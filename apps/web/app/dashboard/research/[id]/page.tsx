import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Brand } from '../../../../components/ui'
import styles from '../../../../components/research.module.css'
import type { ResearchRunDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = await authenticatedFetch<ResearchRunDetail>(`/research-runs/${id}`).catch(() => null)
  if (!run) notFound()
  return <main className={styles.shell}>
    <header className={styles.topbar}><Brand href="/dashboard"/><Link href="/dashboard/research">Research queue</Link></header>
    <section className={styles.content}>
      <header><p>{run.status} · {run.goal}</p><h1>{run.prospect.name}</h1><span>{run.prospect.companyName || run.prospect.email || 'Prospect research'} connected to {run.offer.name}.</span></header>
      <div className={styles.detail}>
        <section className={styles.summary}><div><small>Status</small><strong>{run.status}</strong></div><div><small>Sources</small><strong>{run.sources.length}</strong></div><div><small>Evidence claims</small><strong>{run.evidence.length}</strong></div></section>
        {run.status === 'queued' || run.status === 'running' ? <section className={styles.pending}><h2>Research is in progress</h2>The run is safely queued for background workers. You can leave this page; the notification model is ready to alert you when the cited brief is complete.</section> : <section className={styles.sources}>{run.evidence.map((item) => <article key={item.id}><h3>{item.signalType}</h3><p>{item.claim}</p><a href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}</a></article>)}</section>}
      </div>
    </section>
  </main>
}
