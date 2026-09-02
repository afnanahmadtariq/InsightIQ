import { ArrowRight, Check, Copy, FileText, Globe2, Search, ShieldCheck, Sparkles, Target, UserRound } from 'lucide-react'
import Link from 'next/link'
import { DealBriefPreview } from '../components/landing/deal-brief-preview'
import { EvidencePanel } from '../components/landing/evidence-panel'
import { Eyebrow } from '../components/landing/eyebrow'
import { FeatureCard, type LandingFeature } from '../components/landing/feature-card'
import { LandingBrand } from '../components/landing/landing-brand'
import { RevealObserver } from '../components/landing/reveal-observer'
import { StepCard } from '../components/landing/step-card'
import { WaitlistForm } from '../components/landing/waitlist-form'
import { ButtonLink } from '../components/ui/button'

const container = 'mx-auto w-[min(1160px,calc(100%_-_48px))] max-sm:w-[calc(100%_-_36px)]'
const sectionTitle = 'm-0 text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.04] font-normal tracking-[-.055em] text-iq-900'

const features: LandingFeature[] = [
  { number: '01', icon: Globe2, title: 'Multi-source research', body: 'Resolve a prospect and research the public web in parallel.' },
  { number: '02', icon: Target, title: 'Offer-aware intelligence', body: 'Match current signals to the value you actually sell.' },
  { number: '03', icon: FileText, title: 'Dynamic Deal Briefs', body: 'Get outreach, questions, objections, and next steps.' },
  { number: '04', icon: ShieldCheck, title: 'Evidence on every claim', body: 'Open the original source behind every generated fact.' },
]

const audiences = ['B2B SaaS', 'Real estate', 'Luxury', 'Wealth management', 'Solopreneurs']

export default function Home() {
  return <main className="min-h-screen overflow-clip bg-iq-50 text-iq-950">
    <RevealObserver/>

    <nav className={`${container} relative z-20 flex items-center justify-between py-5`} aria-label="Main navigation">
      <a href="#top" aria-label="InsightIQ home"><LandingBrand/></a>
      <div className="flex items-center gap-7 text-sm font-medium text-iq-600 max-sm:gap-0">
        <a className="transition-colors hover:text-brand max-sm:hidden" href="#how-it-works">How it works</a>
        <a className="transition-colors hover:text-brand max-sm:hidden" href="#features">Features</a>
        <Link className="transition-colors hover:text-brand max-sm:hidden" href="/sign-in">Sign in</Link>
        <ButtonLink href="#waitlist" variant="secondary" size="xs" className="bg-white/80 text-brand! shadow-card">Join the waitlist</ButtonLink>
      </div>
    </nav>

    <section className={`${container} relative grid min-h-0 grid-cols-1 items-center gap-16 pt-12 pb-20 lg:min-h-[650px] lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)] lg:gap-[clamp(48px,6vw,84px)] lg:py-[68px] lg:pb-24`} id="top">
      <div className="relative z-10 animate-[riseIn_560ms_var(--ease-fluid)_both] lg:max-w-[760px] motion-reduce:animate-none">
        <Eyebrow>Evidence-first sales intelligence</Eyebrow>
        <h1 className="m-0 max-w-[680px] text-[clamp(3.5rem,6vw,5.35rem)] leading-[.98] font-normal tracking-[-.06em] text-iq-900 max-sm:text-[clamp(3rem,14.5vw,4.35rem)]">Know the prospect.<br/><em className="text-brand-bright not-italic">Earn the conversation.</em></h1>
        <p className="mt-7 mb-8 max-w-[590px] text-[1.08rem] leading-relaxed text-iq-600 max-sm:text-base">Turn live public signals into tailored Deal Briefs—with a source behind every claim.</p>
        <div className="flex items-center gap-5 max-sm:items-start max-sm:flex-col max-sm:gap-3">
          <ButtonLink href="#waitlist" size="md" className="min-w-[194px] justify-between"><span>Get early access</span><ArrowRight size={18}/></ButtonLink>
          <span className="text-xs font-medium text-iq-500">Coming soon · Private beta</span>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[.65rem] font-semibold tracking-wider text-iq-500 uppercase">Built for</span>
          {audiences.map((audience) => <b className="rounded-full border border-iq-200 bg-white/80 px-2.5 py-1.5 text-[.65rem] font-medium text-iq-600" key={audience}>{audience}</b>)}
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[520px]"><DealBriefPreview/></div>
      <div className="pointer-events-none absolute -top-52 -right-80 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(89_188_248_/_18%),transparent_68%)]"/>
    </section>

    <section className="grid grid-cols-1 items-center gap-7 bg-iq-900 px-[max(24px,calc((100vw_-_1160px)/2))] py-12 text-white lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:py-14" data-reveal>
      <div className="flex items-center gap-4 max-sm:items-start max-sm:flex-col max-sm:gap-0"><strong className="text-[clamp(3.2rem,6vw,5.2rem)] font-normal tracking-[-.07em] text-sky">30%</strong><p className="m-0 max-w-[270px] leading-relaxed text-iq-300">of a seller’s week can disappear into manual prospect research.</p></div>
      <p className="m-0 text-lg leading-relaxed text-iq-200">Contact databases tell you <em className="text-sky not-italic">who</em>. InsightIQ uncovers <em className="text-sky not-italic">why now</em>—and shows its work.</p>
    </section>

    <section className={`${container} py-28 max-sm:py-20`} id="how-it-works">
      <div className="mb-12 max-w-[720px] max-sm:mb-9" data-reveal><Eyebrow>From identity to opportunity</Eyebrow><h2 className={sectionTitle}>Research that keeps working<br/>while you keep selling.</h2></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StepCard number="01" icon={<UserRound size={21}/>} title="Add your prospect" body="Share an identity and the offer you want to position."/>
        <StepCard number="02" icon={<Search size={21}/>} title="InsightIQ investigates" body="Research agents gather fresh company and public signals." delay="delay-one"/>
        <StepCard number="03" icon={<Sparkles size={21}/>} title="Receive your Deal Brief" body="Open a cited playbook for your next conversation." delay="delay-two"/>
      </div>
    </section>

    <section className="grid grid-cols-1 items-center gap-12 bg-iq-100 px-[max(24px,calc((100vw_-_1160px)/2))] py-20 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:py-28" id="evidence">
      <div data-reveal>
        <Eyebrow>Trust is a product feature</Eyebrow><h2 className={sectionTitle}>No black-box claims.<br/>No awkward surprises.</h2>
        <p className="my-6 max-w-[520px] text-base leading-relaxed text-iq-600">Every recommendation carries its evidence, ready to inspect before the conversation.</p>
        <ul className="m-0 grid list-none gap-3 p-0 text-sm text-iq-700">
          {['Clickable citations on generated claims', 'Facts separated from AI interpretation', 'Current research, not stale records'].map((item) => <li className="flex items-center gap-2.5" key={item}><span className="grid size-[22px] place-items-center rounded-full bg-[#dff5ea] text-success"><Check size={13}/></span>{item}</li>)}
        </ul>
      </div>
      <EvidencePanel/>
    </section>

    <section className={`${container} py-28 max-sm:py-20`} id="features">
      <div className="mb-12 flex flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-14" data-reveal>
        <div><Eyebrow>Built for the full deal cycle</Eyebrow><h2 className={sectionTitle}>One research run.<br/>Many ways to move.</h2></div>
        <p className="m-0 max-w-[390px] text-base leading-relaxed text-iq-600">Switch the goal. InsightIQ reshapes the intelligence for outreach or meeting prep.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{features.map((feature, index) => <FeatureCard feature={feature} delay={index % 2 ? 'delay-one' : ''} key={feature.number}/>)}</div>
    </section>

    <section className={`${container} mb-28 overflow-hidden rounded-[22px] border border-iq-200 bg-white shadow-card max-sm:mb-20`} data-reveal>
      <div className="flex gap-1 overflow-x-auto border-b border-iq-200 bg-iq-100 p-2.5 text-xs font-medium text-iq-500"><span className="rounded-lg bg-white px-3.5 py-2.5 text-brand shadow-card">Outreach brief</span><span className="whitespace-nowrap px-3.5 py-2.5">Meeting prep</span><span className="whitespace-nowrap px-3.5 py-2.5">Follow-up plan</span></div>
      <div className="grid grid-cols-1 items-center gap-9 px-5 py-8 lg:grid-cols-[1fr_.85fr] lg:gap-16 lg:p-12">
        <div><Eyebrow>Dynamic by design</Eyebrow><h2 className={sectionTitle}>The right output for<br/>the conversation ahead.</h2><p className="mt-5 mb-0 max-w-[490px] text-base leading-relaxed text-iq-600">Choose the goal. Get the questions, messaging, and next actions that fit it.</p></div>
        <div className="rounded-panel border border-iq-200 bg-iq-50 p-6"><span className="text-[.65rem] font-semibold tracking-wider text-brand-bright uppercase">Personalized opener</span><p className="my-5 text-base leading-relaxed text-iq-700">“Alex, I noticed Northstar is hiring across two new regions. At that stage, ramp consistency often becomes the constraint…”</p><div className="flex items-center justify-between gap-4 border-t border-iq-200 pt-4 text-xs text-iq-500 max-sm:items-start max-sm:flex-col"><b>Based on 3 verified signals</b><span className="inline-flex items-center gap-1.5 font-semibold text-brand"><Copy size={14}/> Copy draft</span></div></div>
      </div>
    </section>

    <section className="grid grid-cols-1 items-center gap-12 bg-iq-900 px-[max(24px,calc((100vw_-_1160px)/2))] py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:py-24" id="waitlist">
      <div data-reveal><Eyebrow inverse>Coming soon</Eyebrow><h2 className={`${sectionTitle} text-white`}>Be first to turn signals<br/>into conversations.</h2><p className="mt-6 mb-0 max-w-[520px] text-base leading-relaxed text-iq-300">Join the private beta waitlist. We’ll reach out when early access opens—no noise, just the signal.</p></div>
      <WaitlistForm/>
    </section>

    <footer className={`${container} flex items-center justify-between py-8 text-xs text-iq-500 max-sm:items-start max-sm:flex-col max-sm:gap-3`}><LandingBrand compact/><p className="m-0">Evidence-first intelligence for better conversations.</p><span>© 2026 InsightIQ</span></footer>
  </main>
}
