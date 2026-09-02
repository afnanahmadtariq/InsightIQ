import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, SiteShell } from '../../components/site-shell'

export const metadata: Metadata = {
  title: 'About · InsightIQ',
  description: 'InsightIQ turns live public signals into evidence-backed Deal Briefs for better sales conversations.',
}

export default function AboutPage() {
  return <SiteShell title="About InsightIQ" lead="Evidence-first sales intelligence for people who sell with context, not guesswork.">
    <Section title="What we build">
      <p>InsightIQ researches public signals about a prospect, connects them to the offer you sell, and produces a Deal Brief you can verify—with a source behind every claim.</p>
    </Section>
    <Section title="Who it’s for">
      <p>Built for B2B sellers, founders, and specialists who need timely context before outreach or meetings—without spending half the week on manual research.</p>
    </Section>
    <Section title="Where we are">
      <p>InsightIQ is in private beta. We’re shipping the research → evidence → brief loop first, then expanding integrations and workflows.</p>
      <p><Link href="/#waitlist">Join the waitlist</Link> or <Link href="/contact">get in touch</Link>.</p>
    </Section>
  </SiteShell>
}
