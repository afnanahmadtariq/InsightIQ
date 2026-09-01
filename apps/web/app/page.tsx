'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState, type ReactNode } from 'react'
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-insightiq.zerotools.online'

const features = [
  { number: '01', icon: FiGlobe, title: 'Multi-source research', body: 'Resolve a prospect and research the public web in parallel.' },
  { number: '02', icon: FiTarget, title: 'Offer-aware intelligence', body: 'Match current signals to the value you actually sell.' },
  { number: '03', icon: FiFileText, title: 'Dynamic Deal Briefs', body: 'Get outreach, questions, objections, and next steps.' },
  { number: '04', icon: FiShield, title: 'Evidence on every claim', body: 'Open the original source behind every generated fact.' },
]

const audiences = ['B2B SaaS', 'Real estate', 'Luxury', 'Wealth management', 'Solopreneurs']

function LandingBrand({ compact = false }: { compact?: boolean }) {
  return <div className={`flex items-center gap-[9px] font-bold tracking-[-.035em] text-[#143b85] ${compact ? 'text-[.92rem] [&_img]:size-[29px]' : 'text-[1.08rem] [&_img]:size-9'}`}><Image className="rounded-[10px] object-cover" src="/insightiq-logo-padded.svg" alt="" width={42} height={42}/><span>InsightIQ</span></div>
}

function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <p className={`mb-[17px] flex items-center gap-[9px] text-[.68rem] font-semibold tracking-[.13em] uppercase ${inverse ? 'text-[#5ec1f2] [&>span]:bg-[#5ec1f2]' : 'text-[#1687dc] [&>span]:bg-[#28a5ef]'}`}><span className="h-0.5 w-[18px] rounded-full"/>{children}</p>
}

function StepCard({ number, icon, title, body, delay = '' }: { number: string; icon: ReactNode; title: string; body: string; delay?: string }) {
  return <article className={`group relative min-h-[235px] rounded-[19px] border border-[#dce9f5] bg-white p-7 shadow-[0_12px_36px_rgb(37_83_141_/_5%)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1.5 hover:border-[#bdddf4] hover:shadow-[0_22px_48px_rgb(37_83_141_/_10%)] motion-reduce:transition-none max-[900px]:min-h-0 ${delay}`} data-reveal><span className="absolute top-[23px] right-6 text-[.68rem] font-semibold text-[#b4c3d6]">{number}</span><div className="mb-[38px] grid size-[46px] place-items-center rounded-[14px] bg-[linear-gradient(145deg,#e8f7ff,#eaf0fd)] text-[1.2rem] text-[#1689da] transition-transform duration-200 group-hover:-rotate-5 group-hover:scale-108 motion-reduce:transition-none max-[900px]:mb-[30px]">{icon}</div><h3 className="mt-0 mb-[11px] text-[1.12rem] text-[#244973]">{title}</h3><p className="m-0 text-[.96rem] leading-[1.6] text-[#7589a7]">{body}</p></article>
}

function FeatureCard({ feature, delay = '' }: { feature: (typeof features)[number]; delay?: string }) {
  const Icon = feature.icon
  return <article className={`relative rounded-[18px] border border-[#dce9f6] bg-white p-[30px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[5px] hover:border-[#bdddf4] hover:shadow-[0_20px_44px_rgb(37_83_141_/_9%)] motion-reduce:transition-none ${delay}`} data-reveal><span className="absolute top-[25px] right-[27px] text-[.68rem] font-semibold text-[#9eb6cf]">{feature.number}</span><div className="grid size-[46px] place-items-center rounded-[14px] bg-[linear-gradient(145deg,#e7f7ff,#edf2fd)] text-[1.2rem] text-[#1689da]"><Icon/></div><h3 className="mt-7 mb-2.5 text-[1.15rem] text-[#244a78]">{feature.title}</h3><p className="m-0 max-w-[470px] text-[.98rem] leading-[1.6] text-[#7489a7]">{feature.body}</p></article>
}

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    elements.forEach((element) => element.classList.add('reveal-pending'))

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('revealed')
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
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] font-sans text-[#122b57] scroll-smooth">
      <nav className="relative z-10 mx-auto flex w-[min(1180px,calc(100%_-_48px))] items-center justify-between py-6 max-[620px]:w-[calc(100%_-_36px)]" aria-label="Main navigation">
        <a className="no-underline" href="#top" aria-label="InsightIQ home"><LandingBrand/></a>
        <div className="flex items-center gap-8 max-[620px]:gap-0 [&_a]:text-[.82rem] [&_a]:font-medium [&_a]:text-[#607696] [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-150 [&_a:hover]:text-[#167fd2] max-[620px]:[&_a:not(:last-child)]:hidden">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link href="/sign-in">Sign in</Link>
          <a href="#waitlist" className="rounded-[10px] border border-[#cfe2f5] bg-white/72 px-[15px] py-2.5 text-[#1767ba]!">Join the waitlist</a>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[690px] w-[min(1180px,calc(100%_-_48px))] grid-cols-[minmax(0,1.12fr)_minmax(380px,.88fr)] items-center gap-[74px] pt-[76px] pb-[105px] before:absolute before:-top-[180px] before:-right-[300px] before:z-0 before:size-[780px] before:rounded-full before:bg-[radial-gradient(circle,rgb(89_188_248_/_18%),transparent_67%)] max-[900px]:grid-cols-1 max-[900px]:gap-[58px] max-[900px]:pt-[70px] max-[620px]:min-h-0 max-[620px]:w-[calc(100%_-_36px)] max-[620px]:pt-[58px] max-[620px]:pb-[76px] [&_h1]:m-0 [&_h1]:text-[clamp(3.6rem,6.9vw,6.25rem)] [&_h1]:leading-[.94] [&_h1]:font-light [&_h1]:tracking-[-.07em] [&_h1]:text-[#123875] max-[620px]:[&_h1]:text-[clamp(3rem,15vw,4.8rem)] [&_h1_em]:text-[#1b95e8] [&_h1_em]:not-italic" id="top">
        <div className="relative z-1 animate-[riseIn_700ms_cubic-bezier(.2,.75,.25,1)_both] motion-reduce:animate-none max-[900px]:max-w-[760px]">
          <Eyebrow>Evidence-first sales intelligence</Eyebrow>
          <h1>Know the prospect.<br /><em>Earn the conversation.</em></h1>
          <p className="mt-[30px] mb-[34px] max-w-[590px] text-[1.2rem] leading-[1.65] text-[#607899] max-[620px]:text-[.97rem]">Turn live public signals into tailored Deal Briefs—with a source behind every claim.</p>
          <div className="flex items-center gap-[22px] max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-3.5">
            <a href="#waitlist" className="inline-flex items-center gap-[22px] rounded-xl bg-[linear-gradient(135deg,#219fe9,#194aab)] pt-[15px] pr-5 pb-[15px] pl-[22px] text-[.88rem] font-semibold text-white! no-underline transition-[filter] duration-200 hover:brightness-95 motion-reduce:transition-none [&_svg]:text-[1.05rem]">Get early access <FiArrowRight aria-hidden="true" /></a>
            <span className="text-[.75rem] font-medium text-[#7a8fae]">Coming soon · Private beta</span>
          </div>
          <div className="mt-11 flex flex-wrap items-center gap-2 max-[620px]:mt-[34px] [&>span]:mr-[3px] [&>span]:text-[.66rem] [&>span]:font-semibold [&>span]:tracking-[.08em] [&>span]:text-[#8a9bb4] [&>span]:uppercase [&_b]:rounded-full [&_b]:border [&_b]:border-[#dce9f6] [&_b]:bg-white/72 [&_b]:px-[9px] [&_b]:py-1.5 [&_b]:text-[.65rem] [&_b]:font-medium [&_b]:text-[#6680a2]">
            <span>Built for</span>
            {audiences.map((audience) => <b key={audience}>{audience}</b>)}
          </div>
        </div>

        <div className="relative z-1 isolate animate-[riseIn_850ms_120ms_cubic-bezier(.2,.75,.25,1)_both] motion-reduce:animate-none max-[900px]:mx-auto max-[900px]:w-[min(520px,calc(100%_-_20px))] max-[620px]:w-full">
          <div className="absolute inset-[-58px] z-0 animate-[slowSpin_26s_linear_infinite] rounded-full border border-[rgb(37_152_224_/_14%)] before:absolute before:inset-[42px] before:rounded-[inherit] before:border before:border-dashed before:border-[rgb(37_152_224_/_13%)] motion-reduce:animate-none max-[620px]:inset-[-25px] [&_span]:absolute [&_span]:size-2.5 [&_span]:rounded-full [&_span]:border-[3px] [&_span]:border-[#eef8ff] [&_span]:bg-[#249de5] [&_span]:shadow-[0_0_0_7px_rgb(36_157_229_/_10%)] [&_span:nth-child(1)]:top-[12%] [&_span:nth-child(1)]:left-[18%] [&_span:nth-child(2)]:right-[7%] [&_span:nth-child(2)]:bottom-[28%] [&_span:nth-child(3)]:bottom-[6%] [&_span:nth-child(3)]:left-[25%]" aria-hidden="true"><span/><span/><span/></div>
          <div className="absolute -top-[27px] -right-[18px] z-3 flex animate-[chipFloat_5s_800ms_ease-in-out_infinite] items-center gap-[7px] rounded-[11px] border border-[#d8eaf8] bg-white/96 px-3 py-2.5 text-[.7rem] font-semibold text-[#257fc0] shadow-[0_12px_34px_rgb(28_76_139_/_13%)] motion-reduce:animate-none max-[620px]:right-1 [&_svg]:text-[.9rem] [&_svg]:text-[#1aa1e9]"><FiStar/><span>AI synthesis</span></div>
          <div className="relative z-2 animate-[gentleFloat_7s_ease-in-out_infinite] rounded-3xl border border-[#d6e8f8] bg-white/94 p-[27px] shadow-[0_34px_90px_rgb(28_76_139_/_14%)] motion-reduce:animate-none max-[620px]:w-auto max-[620px]:p-[19px]" aria-label="Example InsightIQ Deal Brief">
          <div className="flex items-center justify-between border-b border-[#e7eef7] pb-[19px] [&>div]:flex [&>div]:items-center [&>div]:gap-[9px] [&_p]:m-0 [&_p]:grid [&_p]:gap-px [&_p_b]:text-[.76rem] [&_p_b]:text-[#234775] [&_p_small]:text-[.6rem] [&_p_small]:text-[#91a1b8]">
            <div><Image className="size-[30px] rounded-[9px] object-contain" src="/insightiq-logo.svg" alt="" width={30} height={30}/><p><b>Deal Brief</b><small>Prepared 2 minutes ago</small></p></div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#edf9f4] px-[9px] py-1.5 text-[.65rem] font-semibold text-[#15805a] [&_svg]:text-[.7rem]"><FiCheck/> Evidence verified</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-[23px] max-[620px]:grid-cols-[auto_1fr] [&_h2]:mt-0 [&_h2]:mb-[3px] [&_h2]:text-[1.1rem] [&_h2]:text-[#173c72] [&_p]:m-0 [&_p]:text-[.76rem] [&_p]:text-[#7b8faa]">
            <div className="grid size-12 place-items-center rounded-[15px] bg-[#edf5fd] text-[.78rem] font-bold text-[#2364a8]">AM</div>
            <div><h2>Alex Morgan</h2><p>VP of Revenue · Northstar Cloud</p></div>
            <span className="grid justify-items-end text-[.56rem] text-[#8ca0ba] uppercase max-[620px]:hidden [&_b]:text-[1.15rem] [&_b]:leading-none [&_b]:text-[#1988d7]"><b>92%</b> offer fit</span>
          </div>
          <div className="relative grid grid-cols-[auto_1fr_auto] gap-3 overflow-hidden rounded-[15px] border border-[#dceafa] bg-[#f8fbff] p-4 after:absolute after:top-0 after:bottom-0 after:-left-[35%] after:w-[28%] after:skew-x-[-18deg] after:animate-[signalScan_5.5s_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,rgb(63_178_237_/_10%),transparent)] motion-reduce:after:animate-none [&_span]:text-[.62rem] [&_span]:font-semibold [&_span]:tracking-[.07em] [&_span]:text-[#2298de] [&_span]:uppercase [&_h3]:my-1 [&_h3]:text-[.88rem] [&_h3]:text-[#224675] [&_p]:m-0 [&_p]:text-[.74rem] [&_p]:leading-normal [&_p]:text-[#7c90ac] [&_a]:text-[.8rem] [&_a]:text-[#248ed5] [&_a]:no-underline">
            <div className="grid size-[29px] place-items-center rounded-[9px] bg-[#e4f5ff] font-semibold text-[#168de0]"><FiTrendingUp/></div>
            <div><span>High-intent signal</span><h3>Scaling the enterprise sales team</h3><p>Northstar opened 14 enterprise roles after expanding into two new regions.</p></div>
            <a href="#evidence" aria-label="View source citation"><FiExternalLink /></a>
          </div>
          <div className="mt-[11px] grid grid-cols-2 gap-2.5 max-[620px]:grid-cols-1 [&>div]:rounded-xl [&>div]:border [&>div]:border-[#e2ebf5] [&>div]:p-[13px] [&_span]:text-[.59rem] [&_span]:font-semibold [&_span]:tracking-[.06em] [&_span]:text-[#8295af] [&_span]:uppercase [&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-[.74rem] [&_p]:leading-[1.45] [&_p]:text-[#3c5c84]">
            <div><span>Lead with</span><p>Faster ramp time for a distributed sales team.</p></div>
            <div><span>Ask about</span><p>Consistency across new regional teams.</p></div>
          </div>
          <div className="mt-[18px] flex justify-between text-[.56rem] font-medium text-[#8799b1] max-[620px]:gap-2"><span>7 verified signals</span><span>3 strategic angles</span><span>5 cited sources</span></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[.75fr_1.25fr] items-center gap-[88px] bg-[#13366e] px-[max(24px,calc((100vw_-_1180px)/2))] py-[62px] text-white max-[900px]:grid-cols-1 max-[900px]:gap-[50px] max-[620px]:gap-[30px] max-[620px]:py-[50px] [&>div]:flex [&>div]:items-center [&>div]:gap-[18px] max-[620px]:[&>div]:flex-col max-[620px]:[&>div]:items-start max-[620px]:[&>div]:gap-1 [&_strong]:text-[clamp(3.2rem,6vw,5.5rem)] [&_strong]:font-light [&_strong]:tracking-[-.07em] [&_strong]:text-[#53bcf4] [&_div_p]:m-0 [&_div_p]:max-w-[265px] [&_div_p]:text-[.95rem] [&_div_p]:leading-normal [&_div_p]:text-[#b8c9df] [&>p]:m-0 [&>p]:text-[1.16rem] [&>p]:leading-[1.65] [&>p]:text-[#d7e2ef] [&_i]:text-[#62c3f5] [&_i]:not-italic" data-reveal>
        <div><strong>30%</strong><p>of a seller’s week can disappear into manual prospect research.</p></div>
        <p>Contact databases tell you <i>who</i>. InsightIQ uncovers <i>why now</i>—and shows its work.</p>
      </section>

      <section className="mx-auto w-[min(1180px,calc(100%_-_48px))] py-[120px] max-[620px]:w-[calc(100%_-_36px)] max-[620px]:py-[86px]" id="how-it-works">
        <div className="mb-[58px] max-w-[700px] max-[620px]:mb-[38px] [&_h2]:m-0 [&_h2]:text-[clamp(2.45rem,4.5vw,4.2rem)] [&_h2]:leading-[1.03] [&_h2]:font-light [&_h2]:tracking-[-.06em] [&_h2]:text-[#153a73]" data-reveal>
          <Eyebrow>From identity to opportunity</Eyebrow>
          <h2>Research that keeps working<br />while you keep selling.</h2>
        </div>
        <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
          <StepCard number="01" icon={<FiUser/>} title="Add your prospect" body="Share an identity and the offer you want to position."/>
          <StepCard number="02" icon={<FiSearch/>} title="InsightIQ investigates" body="Research agents gather fresh company and public signals." delay="delay-one"/>
          <StepCard number="03" icon={<FiStar/>} title="Receive your Deal Brief" body="Open a cited playbook for your next conversation." delay="delay-two"/>
        </div>
      </section>

      <section className="grid grid-cols-[.9fr_1.1fr] items-center gap-[95px] bg-[#eff7fe] px-[max(24px,calc((100vw_-_1180px)/2))] py-[120px] max-[900px]:grid-cols-1 max-[900px]:gap-[50px] max-[620px]:px-[18px] max-[620px]:py-[84px] [&_h2]:m-0 [&_h2]:text-[clamp(2.45rem,4.5vw,4.2rem)] [&_h2]:leading-[1.03] [&_h2]:font-light [&_h2]:tracking-[-.06em] [&_h2]:text-[#153a73]" id="evidence">
        <div className="[&>p:not(:first-child)]:my-[26px] [&>p:not(:first-child)]:max-w-[520px] [&>p:not(:first-child)]:text-[1.08rem] [&>p:not(:first-child)]:leading-[1.7] [&>p:not(:first-child)]:text-[#677f9f] [&_ul]:m-0 [&_ul]:grid [&_ul]:list-none [&_ul]:gap-[13px] [&_ul]:p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-2.5 [&_li]:text-[.94rem] [&_li]:text-[#49688f] [&_li_span]:grid [&_li_span]:size-[22px] [&_li_span]:place-items-center [&_li_span]:rounded-full [&_li_span]:bg-[#dff5ea] [&_li_span]:text-[.72rem] [&_li_span]:font-bold [&_li_span]:text-[#13805a]" data-reveal>
          <Eyebrow>Trust is a product feature</Eyebrow>
          <h2>No black-box claims.<br />No awkward surprises.</h2>
          <p>Every recommendation carries its evidence, ready to inspect before the conversation.</p>
          <ul>
            <li><span><FiCheck /></span> Clickable citations on generated claims</li>
            <li><span><FiCheck /></span> Facts separated from AI interpretation</li>
            <li><span><FiCheck /></span> Current research, not stale records</li>
          </ul>
        </div>
        <div className="delay-one rounded-[21px] border border-[#d4e6f7] bg-white p-[25px] shadow-[0_26px_70px_rgb(35_83_145_/_10%)] max-[620px]:p-[19px] [&_article]:grid [&_article]:grid-cols-[auto_1fr_auto] [&_article]:items-center [&_article]:gap-[13px] [&_article]:border-b [&_article]:border-[#edf2f7] [&_article]:px-0.5 [&_article]:py-[17px] [&_article]:transition-[transform,background] [&_article]:duration-200 [&_article:hover]:translate-x-1 [&_article:hover]:bg-[#fbfdff] motion-reduce:[&_article]:transition-none [&_article_b]:text-[.86rem] [&_article_b]:text-[#31557f] [&_article_p]:mt-[3px] [&_article_p]:mb-0 [&_article_p]:text-[.75rem] [&_article_p]:text-[#8395ad]" data-reveal>
          <div className="flex justify-between border-b border-[#e5edf6] pb-[17px] text-[.84rem] font-semibold text-[#3d6089] [&_b]:text-[.75rem] [&_b]:text-[#1a8dd9]"><span>Evidence trail</span><b>5 sources</b></div>
          <article><span className="text-[.66rem] text-[#a3b2c5]">01</span><div><b>Company careers page</b><p>14 enterprise roles added across EMEA and APAC</p></div><span className="inline-flex items-center gap-[3px] rounded-full bg-[#edf9f4] px-[7px] py-[5px] text-[.58rem] font-semibold text-[#18825e] max-[620px]:hidden"><FiCheck/> Verified</span></article>
          <article><span className="text-[.66rem] text-[#a3b2c5]">02</span><div><b>Company newsroom</b><p>Expansion announced into two new markets</p></div><span className="inline-flex items-center gap-[3px] rounded-full bg-[#edf9f4] px-[7px] py-[5px] text-[.58rem] font-semibold text-[#18825e] max-[620px]:hidden"><FiCheck/> Verified</span></article>
          <article><span className="text-[.66rem] text-[#a3b2c5]">03</span><div><b>Public executive profile</b><p>Revenue leader prioritizing repeatable systems</p></div><span className="inline-flex items-center gap-[3px] rounded-full bg-[#edf9f4] px-[7px] py-[5px] text-[.58rem] font-semibold text-[#18825e] max-[620px]:hidden"><FiCheck/> Verified</span></article>
          <div className="mt-4 rounded-[13px] bg-[linear-gradient(135deg,#f0f8ff,#f5f8ff)] p-4 [&_span]:text-[.61rem] [&_span]:font-semibold [&_span]:tracking-[.07em] [&_span]:text-[#1a8bd7] [&_span]:uppercase [&_p]:mt-[7px] [&_p]:mb-0 [&_p]:text-[.84rem] [&_p]:leading-[1.55] [&_p]:text-[#48678d]"><span>InsightIQ synthesis</span><p>Expansion creates an immediate need for repeatable onboarding and sales-process consistency.</p></div>
        </div>
      </section>

      <section className="mx-auto w-[min(1180px,calc(100%_-_48px))] py-[120px] max-[620px]:w-[calc(100%_-_36px)] max-[620px]:py-[86px]" id="features">
        <div className="mb-[55px] flex items-end justify-between gap-[60px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-5 [&_h2]:m-0 [&_h2]:text-[clamp(2.45rem,4.5vw,4.2rem)] [&_h2]:leading-[1.03] [&_h2]:font-light [&_h2]:tracking-[-.06em] [&_h2]:text-[#153a73] [&>p]:m-0 [&>p]:max-w-[380px] [&>p]:text-[1.04rem] [&>p]:leading-[1.65] [&>p]:text-[#6f85a4]" data-reveal>
          <div><Eyebrow>Built for the full deal cycle</Eyebrow><h2>One research run.<br/>Many ways to move.</h2></div>
          <p>Switch the goal. InsightIQ reshapes the intelligence for outreach or meeting prep.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[620px]:grid-cols-1">
          {features.map((feature, index) => <FeatureCard feature={feature} delay={index % 2 === 1 ? 'delay-one' : ''} key={feature.number}/>)}
        </div>
      </section>

      <section className="mx-auto mb-[120px] w-[min(1180px,calc(100%_-_48px))] overflow-hidden rounded-[23px] border border-[#d7e7f6] bg-white shadow-[0_20px_60px_rgb(33_79_137_/_7%)] max-[620px]:mb-[86px] max-[620px]:w-[calc(100%_-_36px)]" data-reveal>
        <div className="flex gap-1 overflow-x-auto border-b border-[#e3edf6] bg-[#f5f9fd] p-2.5 [&_span]:whitespace-nowrap [&_span]:rounded-lg [&_span]:px-[13px] [&_span]:py-[9px] [&_span]:text-[.78rem] [&_span]:font-medium [&_span]:text-[#8194ad] [&_span:first-child]:bg-white [&_span:first-child]:text-[#1a79c4] [&_span:first-child]:shadow-[0_3px_10px_rgb(44_82_128_/_8%)]"><span>Outreach brief</span><span>Meeting prep</span><span>Follow-up plan</span></div>
        <div className="grid grid-cols-[1fr_.85fr] items-center gap-[70px] p-[58px] max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[620px]:px-6 max-[620px]:py-[34px] [&_h2]:m-0 [&_h2]:text-[clamp(2.45rem,4.5vw,4.2rem)] [&_h2]:leading-[1.03] [&_h2]:font-light [&_h2]:tracking-[-.06em] [&_h2]:text-[#153a73] [&>div:first-child>p:not(:first-child)]:mt-[23px] [&>div:first-child>p:not(:first-child)]:mb-0 [&>div:first-child>p:not(:first-child)]:max-w-[490px] [&>div:first-child>p:not(:first-child)]:text-[1.04rem] [&>div:first-child>p:not(:first-child)]:leading-[1.65] [&>div:first-child>p:not(:first-child)]:text-[#7288a6]">
          <div><Eyebrow>Dynamic by design</Eyebrow><h2>The right output for<br/>the conversation ahead.</h2><p>Choose the goal. Get the questions, messaging, and next actions that fit it.</p></div>
          <div className="relative rounded-[17px] border border-[#dce9f5] bg-[#f9fbfe] p-[25px] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[0_18px_36px_rgb(35_83_145_/_10%)] motion-reduce:transition-none [&>span]:text-[.68rem] [&>span]:font-semibold [&>span]:tracking-[.08em] [&>span]:text-[#1c8bd5] [&>span]:uppercase [&>p]:my-5 [&>p]:text-[1.03rem] [&>p]:leading-[1.7] [&>p]:text-[#45658b] [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:border-t [&>div]:border-[#e1eaf4] [&>div]:pt-[15px] [&_b]:text-[.7rem] [&_b]:font-medium [&_b]:text-[#7f92aa] [&_div_span]:inline-flex [&_div_span]:items-center [&_div_span]:gap-1 [&_div_span]:text-[.7rem] [&_div_span]:font-semibold [&_div_span]:text-[#1985cf]"><span>Personalized opener</span><p>“Alex, I noticed Northstar is hiring across two new regions. At that stage, ramp consistency often becomes the constraint…”</p><div><b>Based on 3 verified signals</b><span><FiCopy/> Copy draft</span></div></div>
        </div>
      </section>

      <section className="grid grid-cols-[1.08fr_.92fr] items-center gap-[90px] bg-[#12366f] px-[max(24px,calc((100vw_-_1180px)/2))] py-[105px] max-[900px]:grid-cols-1 max-[900px]:gap-[50px] max-[620px]:px-[18px] max-[620px]:py-[84px] [&_h2]:m-0 [&_h2]:text-[clamp(2.45rem,4.5vw,4.2rem)] [&_h2]:leading-[1.03] [&_h2]:font-light [&_h2]:tracking-[-.06em] [&_h2]:text-white" id="waitlist">
        <div className="[&>p:not(:first-child)]:mt-6 [&>p:not(:first-child)]:mb-0 [&>p:not(:first-child)]:max-w-[520px] [&>p:not(:first-child)]:text-[1.08rem] [&>p:not(:first-child)]:leading-[1.7] [&>p:not(:first-child)]:text-[#bacbe0]" data-reveal>
          <Eyebrow inverse>Coming soon</Eyebrow>
          <h2>Be first to turn signals<br />into conversations.</h2>
          <p>Join the private beta waitlist. We’ll reach out when early access opens—no noise, just the signal.</p>
        </div>
        <form className="delay-one grid grid-cols-[1fr_1.25fr] gap-2.5 rounded-[20px] border border-white/13 bg-white/7 p-[26px] backdrop-blur-xl max-[620px]:grid-cols-1 [&_label]:text-[.74rem] [&_label]:font-medium [&_label]:text-[#bdd0e5] [&_label:nth-of-type(2)]:col-start-2 [&_label:nth-of-type(2)]:row-start-1 max-[620px]:[&_label:nth-of-type(2)]:col-start-1 max-[620px]:[&_label:nth-of-type(2)]:row-auto [&_label_span]:ml-[5px] [&_label_span]:text-[#7895b8] [&_input]:min-w-0 [&_input]:rounded-[10px] [&_input]:border [&_input]:border-white/15 [&_input]:bg-white/9 [&_input]:px-3.5 [&_input]:py-[15px] [&_input]:text-[.92rem] [&_input]:text-white! [&_input]:outline-none [&_input]:transition-colors [&_input]:duration-150 [&_input]:placeholder:text-[#7894b6] [&_input:focus]:border-[#4bb5ec] [&_input:focus]:bg-white/12 [&_button]:col-span-full [&_button]:mt-[5px] [&_button]:flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-[9px] [&_button]:rounded-[10px] [&_button]:border-0 [&_button]:bg-[linear-gradient(135deg,#37b5f3,#1b72c9)] [&_button]:p-[15px] [&_button]:text-[.92rem] [&_button]:font-semibold [&_button]:text-white! [&_button]:transition-[filter] [&_button]:duration-200 [&_button:not(:disabled):hover]:brightness-105 [&_button:disabled]:cursor-default [&_button:disabled]:opacity-72" data-reveal onSubmit={joinWaitlist}>
          <label htmlFor="name">Your name <span>Optional</span></label>
          <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" maxLength={120} />
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required maxLength={254} />
          <button type="submit" disabled={formState === 'submitting' || formState === 'success'}>
            <FiMail />
            {formState === 'submitting' ? 'Joining…' : formState === 'success' ? 'You’re on the list' : 'Join the waitlist'}
            {formState === 'idle' && <FiArrowRight />}
          </button>
          <p className={`col-span-full mt-0.5 mb-0 text-[.68rem] leading-[1.45] ${formState === 'error' ? 'text-[#ffb9bc]' : 'text-[#87a3c4]'}`} aria-live="polite">{message || 'By joining, you agree to receive occasional InsightIQ product updates.'}</p>
        </form>
      </section>

      <footer className="mx-auto flex w-[min(1180px,calc(100%_-_48px))] items-center justify-between py-[34px] max-[620px]:w-[calc(100%_-_36px)] max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-[11px] [&_p]:text-[.78rem] [&_p]:text-[#8294ac] max-[620px]:[&_p]:m-0 [&>span]:text-[.78rem] [&>span]:text-[#8294ac]">
        <LandingBrand compact/>
        <p>Evidence-first intelligence for better conversations.</p>
        <span>© 2026 InsightIQ</span>
      </footer>
    </main>
  )
}
