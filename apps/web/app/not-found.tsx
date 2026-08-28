import Link from 'next/link'
import { ArrowLeft, Compass, SearchX } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui'

const HELPFUL_LINKS = [
  { href: '/', label: 'Back to the homepage' },
  { href: '/demo', label: 'Launch the interactive demo' },
  { href: '/dashboard', label: 'Go to your dashboard' },
]

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink-950">
      <SiteHeader />

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-grid-pan opacity-[0.25]" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[130px]" />

        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-danger-500/30 bg-danger-500/10 px-4 py-1.5 text-xs font-semibold text-danger-500">
            <SearchX size={14} />
            No evidence found for this route
          </div>

          <p className="mt-8 select-none bg-gradient-to-br from-brand-300 via-brand-500 to-persona-solo bg-clip-text text-[9rem] font-black leading-none text-transparent sm:text-[11rem]">
            404
          </p>

          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight text-white sm:text-4xl">
            This page didn't survive the citation check.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-mist-100/60">
            We couldn't verify a source for whatever you were looking for. Unlike our briefs, this
            page really does have zero evidence behind it.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="/" variant="primary">
              <ArrowLeft size={16} /> Back to safety
            </Button>
            <Button href="/demo" variant="outline">
              <Compass size={16} /> Explore the demo
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-mist-100/45">
            {HELPFUL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
