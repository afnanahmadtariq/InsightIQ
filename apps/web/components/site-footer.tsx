import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Twitter, Github, ShieldCheck, Mail } from 'lucide-react'

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Evidence engine', href: '#evidence' },
      { label: 'Deal briefs', href: '#product' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Launch demo', href: '/demo' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'B2B SaaS sales teams', href: '/demo' },
      { label: 'High-ticket B2C agents', href: '/demo' },
      { label: 'Solopreneurs & consultants', href: '/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About InsightIQ', href: '#' },
      { label: 'Hackathon submission', href: '#' },
      { label: 'Responsible OSINT use', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API status', href: '#' },
      { label: 'Security & trust', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-900">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/insightiq-logo.png" alt="InsightIQ" width={34} height={34} className="rounded-[10px]" />
              <span className="text-lg font-extrabold tracking-tight text-white">InsightIQ</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-100/60">
              The evidence-first AI sales intelligence agent — cited deal briefs for B2B SaaS, high-ticket
              B2C, and solopreneur sellers.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-full border border-success-500/25 bg-success-500/10 px-3 py-1.5 text-xs font-medium text-success-500">
              <ShieldCheck size={14} />
              Every claim, cited. No hallucinated facts.
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[Linkedin, Twitter, Github, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-mist-100/70 transition-colors hover:border-brand-400/60 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-100/45">{column.title}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-mist-100/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-mist-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 InsightIQ. Built for the Alibaba Cloud &amp; Qoder AI Hackathon. All demo data is illustrative.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-mist-100/80">Privacy</Link>
            <Link href="#" className="hover:text-mist-100/80">Terms</Link>
            <Link href="#" className="hover:text-mist-100/80">Source policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
