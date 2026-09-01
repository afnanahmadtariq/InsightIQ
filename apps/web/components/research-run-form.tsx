'use client'

import { ArrowRight, BriefcaseBusiness, Building2, ChevronDown, Mail, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { apiRequest } from '../lib/api-client'
import type { ResearchRunSummary } from '../lib/research'
import { Button } from './ui/button'
import { Field } from './ui/form-field'
import { FormMessage } from './ui/form-message'

export function ResearchRunForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const optional = (name: string) => String(form.get(name) || '').trim() || undefined
    try {
      const run = await apiRequest<ResearchRunSummary>('/research-runs', {
        method: 'POST',
        body: JSON.stringify({
          prospectName: optional('prospectName'),
          prospectEmail: optional('prospectEmail'),
          companyName: optional('companyName'),
          companyDomain: optional('companyDomain'),
          linkedinUrl: optional('linkedinUrl'),
          xHandle: optional('xHandle'),
          offerName: optional('offerName'),
          offerContext: optional('offerContext'),
          targetPersona: optional('targetPersona'),
          goal: form.get('goal'),
        }),
      })
      router.push(`/dashboard/research/${run.id}`)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not queue this research run')
      setPending(false)
    }
  }

  return <form className="grid gap-[18px] [&>section]:rounded-[19px] [&>section]:border [&>section]:border-iq-200 [&>section]:bg-white [&>section]:p-[26px] [&>section]:shadow-[0_10px_34px_rgb(27_77_141_/_5%)] max-[700px]:[&>section]:p-5 [&>button]:min-w-[210px] [&>button]:justify-self-start" onSubmit={submit}>
    <section>
      <div className="mb-[23px] flex gap-[13px] text-brand-bright [&_h2]:m-0 [&_h2]:text-[1.16rem] [&_h2]:text-iq-900 [&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-[.88rem] [&_p]:text-iq-600"><UserRound/><div><h2>Who are you researching?</h2><p>Add any identifiers you already trust.</p></div></div>
      <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
        <Field id="prospect-name" name="prospectName" label="Prospect name" placeholder="Maya Chen" required icon={<UserRound size={18}/>}/>
        <Field id="prospect-email" name="prospectEmail" type="email" label="Email (optional)" placeholder="maya@company.com" icon={<Mail size={18}/>}/>
        <Field id="company-name" name="companyName" label="Company (optional)" placeholder="Northstar Labs" icon={<Building2 size={18}/>}/>
        <Field id="company-domain" name="companyDomain" label="Company domain (optional)" placeholder="northstar.com"/>
        <Field id="linkedin-url" name="linkedinUrl" type="url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/…"/>
        <Field id="x-handle" name="xHandle" label="X handle (optional)" placeholder="@mayachen"/>
      </div>
    </section>
    <section>
      <div className="mb-[23px] flex gap-[13px] text-brand-bright [&_h2]:m-0 [&_h2]:text-[1.16rem] [&_h2]:text-iq-900 [&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-[.88rem] [&_p]:text-iq-600"><BriefcaseBusiness/><div><h2>What are you selling?</h2><p>Give the agent enough context to find meaningful alignment.</p></div></div>
      <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
        <Field id="offer-name" name="offerName" label="Offer name" placeholder="Enterprise analytics platform" required/>
        <Field id="target-persona" name="targetPersona" label="Target persona (optional)" placeholder="VP Sales at B2B SaaS"/>
        <label className="col-span-full grid gap-[7px] text-[.86rem] font-[650] text-iq-700"><span>Value proposition and context</span><textarea className="min-h-[130px] w-full resize-y rounded-xl border border-iq-300 bg-white px-3.5 py-[13px] leading-[1.55] text-iq-950 focus:border-brand-bright focus:outline-0 focus:ring-3 focus:ring-brand-bright/10" name="offerContext" minLength={20} maxLength={4000} placeholder="Explain the problem you solve, your strongest differentiators, and the outcome you create…" required/></label>
        <label className="col-span-full grid gap-[7px] text-[.86rem] font-[650] text-iq-700"><span>Research goal</span><span className="relative block"><select className="w-full appearance-none rounded-xl border border-iq-300 bg-white px-3.5 py-[13px] pr-11 text-iq-950 focus:border-brand-bright focus:outline-0 focus:ring-3 focus:ring-brand-bright/10" name="goal" defaultValue="meeting"><option value="meeting">Prepare for a meeting</option><option value="outreach">Create personalized outreach</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2 text-iq-600" size={18} aria-hidden="true"/></span></label>
      </div>
    </section>
    {error && <FormMessage tone="error" className="text-[.8rem]">{error}</FormMessage>}
    <Button type="submit" disabled={pending}>{pending ? 'Queuing research…' : 'Start research run'}{!pending && <ArrowRight size={18}/>}</Button>
  </form>
}
