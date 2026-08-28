import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/landing/hero'
import { ProductSections } from '@/components/landing/sections-product'
import { SocialSections } from '@/components/landing/sections-social'

export default function Home() {
  return (
    <main className="min-h-screen bg-ink-950">
      <SiteHeader />
      <Hero />
      <ProductSections />
      <SocialSections />
      <SiteFooter />
    </main>
  )
}
