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

function GoogleMark() {
  return <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.613Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.182l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.715H.956v2.332A9 9 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.963 10.705A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.705V4.963H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.037l3.007-2.332Z"/>
    <path fill="#EA4335" d="M9 3.58c1.322 0 2.508.454 3.441 1.346l2.582-2.582C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.963l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"/>
  </svg>
}

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
    {googleEnabled && <><div className={styles.divider}>or</div><Button type="button" variant="secondary" className={styles.googleButton} onClick={google} disabled={pending}><GoogleMark/>Continue with Google</Button></>}
  </form>
}
