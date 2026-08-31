import { FileCheck2, Search, Sparkles, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { Brand } from './ui'
import styles from './auth.module.css'

export function AuthShell({ children, mode }: { children: ReactNode; mode: 'sign-in' | 'sign-up' }) {
  return <main className={styles.authPage}>
    <section className={styles.story}>
      <Brand/>
      <div className={styles.storyCopy}>
        <p className={styles.eyebrow}>Evidence-first sales intelligence</p>
        <h1>{mode === 'sign-up' ? 'Know the person. Understand the moment.' : 'Your deal intelligence is ready when you are.'}</h1>
        <p>Research prospects, connect their current signals to your offer, and prepare outreach that can be verified.</p>
        <div className={styles.workflow}><span><Target size={18}/>Identify</span><span><Search size={18}/>Research</span><span><FileCheck2 size={18}/>Verify</span><span><Sparkles size={18}/>Act</span></div>
      </div>
      <small>InsightIQ · Evidence behind every claim</small>
    </section>
    <section className={styles.formSide}><div className={styles.formCard}>{children}</div></section>
  </main>
}
