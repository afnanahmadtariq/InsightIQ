'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import {
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiFileText,
  FiGlobe,
  FiMail,
  FiSearch,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi'
import styles from './page.module.css'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-insightiq.zerotools.online'

const features = [
  { number: '01', icon: FiGlobe, title: 'Multi-source research', body: 'Resolve a prospect and research the public web in parallel.' },
  { number: '02', icon: FiTarget, title: 'Offer-aware intelligence', body: 'Match current signals to the value you actually sell.' },
  { number: '03', icon: FiFileText, title: 'Dynamic Deal Briefs', body: 'Get outreach, questions, objections, and next steps.' },
  { number: '04', icon: FiShield, title: 'Evidence on every claim', body: 'Open the original source behind every generated fact.' },
]

const audiences = ['B2B SaaS', 'Real estate', 'Luxury', 'Wealth management', 'Solopreneurs']

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    elements.forEach((element) => element.classList.add(styles.revealPending))

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add(styles.revealed)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -40px' })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState('submitting')
    setMessage('')

    try {
      const response = await fetch(`${apiUrl}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(payload?.message ?? 'We could not save your email. Please try again.')
      }

      setFormState('success')
      setMessage('You’re on the list. We’ll send the first signal when InsightIQ is ready.')
      setName('')
      setEmail('')
    } catch (error) {
      setFormState('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top" aria-label="InsightIQ home">
          <Image src="/insightiq-logo-padded.svg" alt="" width={42} height={42} priority />
          <span>InsightIQ</span>
        </a>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link href="/sign-in">Sign in</Link>
          <a href="#waitlist" className={styles.navCta}>Join the waitlist</a>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> Evidence-first sales intelligence</p>
          <h1>Know the prospect.<br /><em>Earn the conversation.</em></h1>
          <p className={styles.heroText}>Turn live public signals into tailored Deal Briefs—with a source behind every claim.</p>
          <div className={styles.heroActions}>
            <a href="#waitlist" className={styles.primaryButton}>Get early access <FiArrowRight aria-hidden="true" /></a>
            <span className={styles.comingSoon}>Coming soon · Private beta</span>
          </div>
          <div className={styles.audienceRow}>
            <span>Built for</span>
            {audiences.map((audience) => <b key={audience}>{audience}</b>)}
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.signalOrbit} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.floatingChip}><FiStar /><span>AI synthesis</span></div>
          <div className={styles.brief} aria-label="Example InsightIQ Deal Brief">
          <div className={styles.briefHeader}>
            <div><Image className={styles.miniLogo} src="/insightiq-logo.svg" alt="" width={30} height={30} /><p><b>Deal Brief</b><small>Prepared 2 minutes ago</small></p></div>
            <span className={styles.verified}><FiCheck /> Evidence verified</span>
          </div>
          <div className={styles.prospect}>
            <div className={styles.prospectAvatar}>AM</div>
            <div><h2>Alex Morgan</h2><p>VP of Revenue · Northstar Cloud</p></div>
            <span className={styles.matchScore}><b>92%</b> offer fit</span>
          </div>
          <div className={styles.signalCard}>
            <div className={styles.signalIcon}><FiTrendingUp /></div>
            <div><span>High-intent signal</span><h3>Scaling the enterprise sales team</h3><p>Northstar opened 14 enterprise roles after expanding into two new regions.</p></div>
            <a href="#evidence" aria-label="View source citation"><FiExternalLink /></a>
          </div>
          <div className={styles.briefGrid}>
            <div><span>Lead with</span><p>Faster ramp time for a distributed sales team.</p></div>
            <div><span>Ask about</span><p>Consistency across new regional teams.</p></div>
          </div>
          <div className={styles.briefFooter}><span>7 verified signals</span><span>3 strategic angles</span><span>5 cited sources</span></div>
          </div>
        </div>
      </section>

      <section className={styles.problemBand} data-reveal>
        <div><strong>30%</strong><p>of a seller’s week can disappear into manual prospect research.</p></div>
        <p>Contact databases tell you <i>who</i>. InsightIQ uncovers <i>why now</i>—and shows its work.</p>
      </section>

      <section className={styles.section} id="how-it-works">
        <div className={styles.sectionHeading} data-reveal>
          <p className={styles.eyebrow}><span /> From identity to opportunity</p>
          <h2>Research that keeps working<br />while you keep selling.</h2>
        </div>
        <div className={styles.steps}>
          <article data-reveal><span>01</span><div className={styles.stepIcon}><FiUser /></div><h3>Add your prospect</h3><p>Share an identity and the offer you want to position.</p></article>
          <article className={styles.delayOne} data-reveal><span>02</span><div className={styles.stepIcon}><FiSearch /></div><h3>InsightIQ investigates</h3><p>Research agents gather fresh company and public signals.</p></article>
          <article className={styles.delayTwo} data-reveal><span>03</span><div className={styles.stepIcon}><FiStar /></div><h3>Receive your Deal Brief</h3><p>Open a cited playbook for your next conversation.</p></article>
        </div>
      </section>

      <section className={styles.evidenceSection} id="evidence">
        <div className={styles.evidenceCopy} data-reveal>
          <p className={styles.eyebrow}><span /> Trust is a product feature</p>
          <h2>No black-box claims.<br />No awkward surprises.</h2>
          <p>Every recommendation carries its evidence, ready to inspect before the conversation.</p>
          <ul>
            <li><span><FiCheck /></span> Clickable citations on generated claims</li>
            <li><span><FiCheck /></span> Facts separated from AI interpretation</li>
            <li><span><FiCheck /></span> Current research, not stale records</li>
          </ul>
        </div>
        <div className={`${styles.sourceStack} ${styles.delayOne}`} data-reveal>
          <div className={styles.sourceTop}><span>Evidence trail</span><b>5 sources</b></div>
          <article><span className={styles.sourceNumber}>01</span><div><b>Company careers page</b><p>14 enterprise roles added across EMEA and APAC</p></div><span className={styles.sourceState}><FiCheck /> Verified</span></article>
          <article><span className={styles.sourceNumber}>02</span><div><b>Company newsroom</b><p>Expansion announced into two new markets</p></div><span className={styles.sourceState}><FiCheck /> Verified</span></article>
          <article><span className={styles.sourceNumber}>03</span><div><b>Public executive profile</b><p>Revenue leader prioritizing repeatable systems</p></div><span className={styles.sourceState}><FiCheck /> Verified</span></article>
          <div className={styles.synthesis}><span>InsightIQ synthesis</span><p>Expansion creates an immediate need for repeatable onboarding and sales-process consistency.</p></div>
        </div>
      </section>

      <section className={styles.section} id="features">
        <div className={styles.sectionHeadingSplit} data-reveal>
          <div><p className={styles.eyebrow}><span /> Built for the full deal cycle</p><h2>One research run.<br />Many ways to move.</h2></div>
          <p>Switch the goal. InsightIQ reshapes the intelligence for outreach or meeting prep.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            const delayClass = index % 2 === 1 ? styles.delayOne : undefined
            return <article className={delayClass} data-reveal key={feature.number}><span>{feature.number}</span><div className={styles.featureIcon}><Icon /></div><h3>{feature.title}</h3><p>{feature.body}</p></article>
          })}
        </div>
      </section>

      <section className={styles.outputSection} data-reveal>
        <div className={styles.outputTabs}><span>Outreach brief</span><span>Meeting prep</span><span>Follow-up plan</span></div>
        <div className={styles.outputContent}>
          <div><p className={styles.eyebrow}><span /> Dynamic by design</p><h2>The right output for<br />the conversation ahead.</h2><p>Choose the goal. Get the questions, messaging, and next actions that fit it.</p></div>
          <div className={styles.messageCard}><span>Personalized opener</span><p>“Alex, I noticed Northstar is hiring across two new regions. At that stage, ramp consistency often becomes the constraint…”</p><div><b>Based on 3 verified signals</b><span><FiCopy /> Copy draft</span></div></div>
        </div>
      </section>

      <section className={styles.waitlist} id="waitlist">
        <div className={styles.waitlistCopy} data-reveal>
          <p className={styles.eyebrow}><span /> Coming soon</p>
          <h2>Be first to turn signals<br />into conversations.</h2>
          <p>Join the private beta waitlist. We’ll reach out when early access opens—no noise, just the signal.</p>
        </div>
        <form className={`${styles.form} ${styles.delayOne}`} data-reveal onSubmit={joinWaitlist}>
          <label htmlFor="name">Your name <span>Optional</span></label>
          <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" maxLength={120} />
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required maxLength={254} />
          <button type="submit" disabled={formState === 'submitting' || formState === 'success'}>
            <FiMail />
            {formState === 'submitting' ? 'Joining…' : formState === 'success' ? 'You’re on the list' : 'Join the waitlist'}
            {formState === 'idle' && <FiArrowRight />}
          </button>
          <p className={formState === 'error' ? styles.formError : styles.formMessage} aria-live="polite">{message || 'By joining, you agree to receive occasional InsightIQ product updates.'}</p>
        </form>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}><Image src="/insightiq-logo-padded.svg" alt="" width={36} height={36} /><span>InsightIQ</span></div>
        <p>Evidence-first intelligence for better conversations.</p>
        <span>© 2026 InsightIQ</span>
      </footer>
    </main>
  )
}
