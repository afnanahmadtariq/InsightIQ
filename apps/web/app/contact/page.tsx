import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, SiteShell } from '../../components/site-shell'

export const metadata: Metadata = {
  title: 'Contact · InsightIQ',
  description: 'Get in touch with the InsightIQ team.',
}

export default function ContactPage() {
  return <SiteShell title="Contact" lead="We’re a small team building InsightIQ. Reach out and we’ll get back as soon as we can.">
    <Section title="Product & support">
      <p>Ready to begin? <Link href="/sign-up">Create your workspace</Link>. For product questions, contact us below.</p>
    </Section>
    <Section title="Email">
      <p>General, privacy, and support: <a href="mailto:hello@insightiq.app">hello@insightiq.app</a></p>
    </Section>
    <Section title="Policies">
      <p>Read our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.</p>
    </Section>
  </SiteShell>
}
