'use client'

import Image from 'next/image'
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
          <div className={styles.brand}>
            <Image src="/insightiq-logo.png" alt="InsightIQ" width={44} height={44} priority />
            <span>InsightIQ</span>
          </div>
          <p className={styles.headerLabel}>Intelligence workspace</p>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Decisions, made clearer</p>
            <h1>Turn complexity into<br /><em>your next best move.</em></h1>
            <p className={styles.description}>InsightIQ helps teams surface what matters, connect the dots, and move forward with confidence.</p>
            <button className={styles.primaryButton} type="button">Explore insights <span>→</span></button>
          </div>

          <div className={styles.preview} aria-label="Insight preview">
            <div className={styles.previewTop}><span>Weekly signal</span><b>Updated now</b></div>
            <div className={styles.metric}><strong>+24.8%</strong><span>Meaningful momentum</span></div>
            <div className={styles.chart} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className={styles.previewFooter}><span className={styles.avatar}>IQ</span><span>Insight confidence <b>High</b></span></div>
          </div>
        </section>

        <section className={styles.designSystem} aria-labelledby="design-system-title">
          <div className={styles.systemIntro}>
            <div>
              <p className={styles.eyebrow}>InsightIQ design language</p>
              <h2 id="design-system-title">Bright, focused, and built for trust.</h2>
            </div>
            <p>Simple surfaces keep attention on the signal. Blue provides depth; crisp whitespace creates room to think.</p>
          </div>

          <div className={styles.systemGrid}>
            <article className={styles.systemCard}>
              <h3>Signal palette</h3>
              <div className={styles.swatches}>
                <span className={styles.ink}><i />Deep blue</span>
                <span className={styles.blue}><i />Insight blue</span>
                <span className={styles.sky}><i />Sky</span>
                <span className={styles.mist}><i />Canvas</span>
              </div>
            </article>

            <article className={styles.systemCard}>
              <h3>Typography</h3>
              <p className={styles.typeSample}>The next move, made obvious.</p>
              <span className={styles.token}>Outfit · 300 / 500 / 700</span>
            </article>

            <article className={styles.systemCard}>
              <h3>Interaction</h3>
              <div className={styles.componentRow}>
                <span className={styles.buttonSample}>View insight <b>→</b></span>
                <span className={styles.statusSample}><i /> Live</span>
              </div>
              <span className={styles.token}>16px radius · quiet shadows</span>
            </article>
          </div>
        </section>

        <p className={`${styles.status} ${styles[status]}`}>
          <span aria-hidden="true" />
          {status === 'checking' && 'Checking platform status…'}
          {status === 'connected' && 'InsightIQ platform connected'}
          {status === 'unavailable' && 'Platform temporarily unavailable'}
        </p>
      </section>
    </main>
  )
}
