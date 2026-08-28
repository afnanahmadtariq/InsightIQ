'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#personas', label: "Who it's for" },
  { href: '#evidence', label: 'Evidence engine' },
  { href: '#pricing', label: 'Pricing' },
]

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isScrolled ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/insightiq-logo.png" alt="InsightIQ" width={34} height={34} className="rounded-[10px]" priority />
          <span className="text-lg font-extrabold tracking-tight text-white">InsightIQ</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist-100/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/demo" variant="ghost">
            Sign in
          </Button>
          <Button href="/demo" variant="primary">
            Launch demo
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-ink-950/95 px-6 py-5 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-mist-100/80"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <Button href="/demo" variant="outline">Sign in</Button>
              <Button href="/demo" variant="primary">Launch demo</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
