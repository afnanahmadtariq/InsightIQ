'use client'

import { ArrowRight, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { AccountContext } from '../lib/account-context'
import { authClient } from '../lib/auth-client'
import { Button, Field } from './ui'
import styles from './auth.module.css'

function slugFor(name: string) {
  const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) || 'workspace'
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}

export function OnboardingForm({ context }: { context: AccountContext }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState('')
  async function activate(organizationId: string) {
    setPending(true); setError('')
    const result = await authClient.organization.setActive({ organizationId })
    if (result.error) { setError(result.error.message || 'Could not select workspace'); setPending(false); return }
    router.push('/dashboard'); router.refresh()
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('')
    const name = String(new FormData(event.currentTarget).get('name') || '').trim()
    const result = await authClient.organization.create({ name, slug: slugFor(name) })
    if (result.error) { setError(result.error.message || 'Could not create workspace'); setPending(false); return }
    router.push('/dashboard'); router.refresh()
  }
  return <div className={styles.onboardingGrid}>
    {context.workspaces.length > 0 && <section className={styles.existing}><h2>Your workspaces</h2>{context.workspaces.map((workspace) => <button key={workspace.id} onClick={() => activate(workspace.id)} disabled={pending}><Building2 size={19}/><span><strong>{workspace.name}</strong><small>{workspace.role}</small></span><ArrowRight size={17}/></button>)}</section>}
    <form className={styles.form} onSubmit={submit}><Field id="workspace-name" name="name" label="Workspace name" placeholder="Acme sales team" required maxLength={80}/>{error && <p className={styles.error}>{error}</p>}<Button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create workspace'}<ArrowRight size={18}/></Button></form>
  </div>
}
