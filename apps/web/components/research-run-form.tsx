'use client'

import { ArrowRight, BriefcaseBusiness, Building2, ChevronDown, Mail, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { apiRequest } from '../lib/api-client'
import type { ResearchRunSummary } from '../lib/research'
import { Button, Field } from './ui'
import styles from './research.module.css'

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

  return <form className={styles.form} onSubmit={submit}>
    <section>
      <div className={styles.sectionHead}><UserRound/><div><h2>Who are you researching?</h2><p>Add any identifiers you already trust.</p></div></div>
      <div className={styles.grid}>
        <Field id="prospect-name" name="prospectName" label="Prospect name" placeholder="Maya Chen" required icon={<UserRound size={18}/>}/>
        <Field id="prospect-email" name="prospectEmail" type="email" label="Email (optional)" placeholder="maya@company.com" icon={<Mail size={18}/>}/>
        <Field id="company-name" name="companyName" label="Company (optional)" placeholder="Northstar Labs" icon={<Building2 size={18}/>}/>
        <Field id="company-domain" name="companyDomain" label="Company domain (optional)" placeholder="northstar.com"/>
        <Field id="linkedin-url" name="linkedinUrl" type="url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/…"/>
        <Field id="x-handle" name="xHandle" label="X handle (optional)" placeholder="@mayachen"/>
      </div>
    </section>
    <section>
      <div className={styles.sectionHead}><BriefcaseBusiness/><div><h2>What are you selling?</h2><p>Give the agent enough context to find meaningful alignment.</p></div></div>
      <div className={styles.grid}>
        <Field id="offer-name" name="offerName" label="Offer name" placeholder="Enterprise analytics platform" required/>
        <Field id="target-persona" name="targetPersona" label="Target persona (optional)" placeholder="VP Sales at B2B SaaS"/>
        <label className={styles.full}><span>Value proposition and context</span><textarea name="offerContext" minLength={20} maxLength={4000} placeholder="Explain the problem you solve, your strongest differentiators, and the outcome you create…" required/></label>
        <label className={styles.full}><span>Research goal</span><span className={styles.selectWrap}><select name="goal" defaultValue="meeting"><option value="meeting">Prepare for a meeting</option><option value="outreach">Create personalized outreach</option></select><ChevronDown size={18} aria-hidden="true"/></span></label>
      </div>
    </section>
    {error && <p className={styles.error}>{error}</p>}
    <Button type="submit" disabled={pending}>{pending ? 'Queuing research…' : 'Start research run'}{!pending && <ArrowRight size={18}/>}</Button>
  </form>
}
