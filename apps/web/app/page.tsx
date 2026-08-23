'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-insightiq.zerotools.online'

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'unavailable'>('checking')

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((response) => {
        if (!response.ok) throw new Error('Health check failed')
        setStatus('connected')
      })
      .catch(() => setStatus('unavailable'))
  }, [])

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.brandMark}>IQ<span>·</span></div>
          <p className={styles.brandName}>InsightIQ</p>
        </header>

        <div className={styles.hero}>
          <p className={styles.eyebrow}>Intelligence, made useful</p>
          <h1>Find the signal<br /><em>in the noise.</em></h1>
          <p className={styles.description}>InsightIQ brings your most important information into focus, so every decision starts with a clearer picture.</p>
          <div className={styles.heroMeta}><span className={styles.liveDot} /> Intelligence platform <span className={styles.metaDivider} /> Built for momentum</div>
        </div>

        <section className={styles.designSystem} aria-labelledby="design-system-title">
          <div className={styles.systemIntro}>
            <p className={styles.eyebrow}>The InsightIQ system</p>
            <h2 id="design-system-title">Clarity with a point of view.</h2>
          </div>

          <div className={styles.systemGrid}>
            <article className={styles.systemCard}>
              <h3>Signal colours</h3>
              <div className={styles.swatches}>
                <span className={styles.ink}><i />Navy</span>
                <span className={styles.blue}><i />Signal</span>
                <span className={styles.warm}><i />Action</span>
                <span className={styles.mist}><i />Cloud</span>
              </div>
            </article>

            <article className={styles.systemCard}>
              <h3>Type</h3>
              <p className={styles.typeSample}>Make the next move obvious.</p>
              <span className={styles.token}>DM Sans · 800 / 500</span>
            </article>

            <article className={styles.systemCard}>
              <h3>Momentum</h3>
              <div className={styles.componentRow}>
                <span className={styles.buttonSample}>Explore insight</span>
                <span className={styles.statusSample}><i /> Live</span>
              </div>
              <span className={styles.token}>18px cards · 12px controls</span>
            </article>
          </div>
        </section>

        <p className={`${styles.status} ${styles[status]}`}>
          <span aria-hidden="true" />
          {status === 'checking' && 'Checking backend connection…'}
          {status === 'connected' && 'Backend connected'}
          {status === 'unavailable' && 'Backend unavailable'}
        </p>
      </section>
    </main>
  )
}
