import Link from 'next/link'
import { Brand } from '../../../components/ui'
import styles from '../../../components/research.module.css'
import type { ResearchRunSummary } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const runs = await authenticatedFetch<ResearchRunSummary[]>('/research-runs') ?? []
  return <main className={styles.shell}>
    <header className={styles.topbar}><Brand href="/dashboard"/><Link href="/dashboard/research/new">New research run</Link></header>
    <section className={styles.content}>
      <header><p>Research queue</p><h1>Your intelligence runs.</h1><span>Track queued work, inspect cited evidence, and open each generated deal brief.</span></header>
      <div className={styles.list}>{runs.length ? runs.map((run) => <Link className={styles.run} href={`/dashboard/research/${run.id}`} key={run.id}><div><h2>{run.prospect.name}{run.prospect.companyName ? ` · ${run.prospect.companyName}` : ''}</h2><p>{run.offer.name} · {run.goal}</p></div><span className={styles.status}>{run.status}</span></Link>) : <div className={styles.empty}>No research runs yet. Start with a prospect and your offer context.</div>}</div>
    </section>
  </main>
}
