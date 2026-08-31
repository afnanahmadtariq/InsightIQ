'use client'

import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { authClient, webCallbackURL } from '../lib/auth-client'
import { apiRequest } from '../lib/api-client'
import { Button, Field } from './ui'
import styles from './auth.module.css'

type AuthConfiguration = { googleEnabled: boolean }

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    apiRequest<AuthConfiguration>('/auth-config').then((value) => setGoogleEnabled(value.googleEnabled)).catch(() => setGoogleEnabled(false))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')
    try {
      if (mode === 'sign-up') {
        const result = await authClient.signUp.email({ name: String(form.get('name') || '').trim(), email, password, callbackURL: webCallbackURL('/auth/continue') })
        if (result.error) throw new Error(result.error.message || 'Could not create your account')
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      const result = await authClient.signIn.email({ email, password, rememberMe: form.get('remember') === 'on', callbackURL: webCallbackURL('/auth/continue') })
      if (result.error) throw new Error(result.error.message || 'Could not sign in')
      if ('twoFactorRedirect' in result.data && result.data.twoFactorRedirect) return
      router.push('/auth/continue')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to authenticate')
      setPending(false)
    }
  }

  async function google() {
    setPending(true)
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: webCallbackURL('/auth/continue') })
    if (result.error) { setError(result.error.message || 'Google sign-in failed'); setPending(false) }
  }

  return <form className={styles.form} onSubmit={submit}>
    {mode === 'sign-up' && <Field id="name" name="name" label="Full name" placeholder="Your name" autoComplete="name" required icon={<UserRound size={18}/>}/>} 
    <Field id="email" name="email" type="email" label="Work email" placeholder="you@company.com" autoComplete="email" required icon={<Mail size={18}/>}/>
    <Field id="password" name="password" type="password" label="Password" labelAction={mode === 'sign-in' ? <Link href="/forgot-password">Forgot password?</Link> : undefined} placeholder={mode === 'sign-up' ? 'At least 10 characters' : 'Your password'} autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} minLength={10} maxLength={128} required icon={<LockKeyhole size={18}/>}/>
    {mode === 'sign-in' && <label className={styles.check}><input type="checkbox" name="remember"/>Keep me signed in</label>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <Button type="submit" disabled={pending}>{pending ? 'Please wait…' : mode === 'sign-up' ? 'Create workspace' : 'Sign in'} {!pending && <ArrowRight size={18}/>}</Button>
    {googleEnabled && <><div className={styles.divider}>or</div><Button type="button" variant="secondary" onClick={google} disabled={pending}>Continue with Google</Button></>}
  </form>
}
