import Link from 'next/link'
import { ResearchRunForm } from '../../../../components/research-run-form'
import { Brand } from '../../../../components/ui'
import styles from '../../../../components/research.module.css'

export default function Page() {
  return <main className={styles.shell}>
    <header className={styles.topbar}><Brand href="/dashboard"/><Link href="/dashboard/research">View research queue</Link></header>
    <section className={styles.content}>
      <header><p>New research run</p><h1>Connect the evidence to your offer.</h1><span>InsightIQ preserves your inputs, gathers public sources asynchronously, and maps each claim back to evidence.</span></header>
      <ResearchRunForm/>
    </section>
  </main>
}
