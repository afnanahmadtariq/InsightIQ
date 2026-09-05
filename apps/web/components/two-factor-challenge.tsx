'use client'

import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import type { AccountContext } from '../lib/account-context'
import { authClient, consumeAuthReturn } from '../lib/auth-client'
import { Button } from './ui/button'
import { Field } from './ui/form-field'
import { FormMessage } from './ui/form-message'

type ChallengeMethod = 'totp' | 'email' | 'backup'

export function TwoFactorChallenge({ context }: { context: AccountContext }) {
  const router = useRouter()
  const methods: { id: ChallengeMethod; label: string; icon: typeof ShieldCheck }[] = context.user.authenticatorAppEnabled
    ? [
        { id: 'totp', label: 'Authenticator', icon: ShieldCheck },
        { id: 'email', label: 'Email code', icon: Mail },
        { id: 'backup', label: 'Recovery code', icon: KeyRound },
      ]
    : [{ id: 'email', label: 'Email code', icon: Mail }]
  const [method, setMethod] = useState<ChallengeMethod>(context.user.authenticatorAppEnabled ? 'totp' : 'email')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null)
  const [secondsUntilResend, setSecondsUntilResend] = useState(0)
  const [trustDevice, setTrustDevice] = useState(false)

function chooseMethod(next: ChallengeMethod) {
  setMethod(next)
  setCode('')
  setError('')
  setSent(false)
  setResendAvailableAt(null)
}

  async function sendEmailCode() {
    setPending(true)
    setError('')
    const result = await authClient.twoFactor.sendOtp()
    if (result.error) setError(result.error.message || 'Could not send the email code.')
    else {
      setSent(true)
      setResendAvailableAt(Date.now() + 60_000)
    }
    setPending(false)
  }

  useEffect(() => {
    if (method !== 'email' || sent) return
    const timer = window.setTimeout(() => {
      void sendEmailCode()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [method, sent])

  useEffect(() => {
    if (!resendAvailableAt) return
    const resendAt = resendAvailableAt
    function refreshCountdown() {
      setSecondsUntilResend(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)))
    }
    refreshCountdown()
    const timer = window.setInterval(refreshCountdown, 1_000)
    return () => window.clearInterval(timer)
  }, [resendAvailableAt])

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    const result = method === 'totp'
      ? await authClient.twoFactor.verifyTotp({ code, trustDevice })
      : method === 'email'
        ? await authClient.twoFactor.verifyOtp({ code, trustDevice })
        : await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice })

    if (result.error) {
      setError(result.error.message || 'That code could not be verified.')
      setPending(false)
      return
    }

    router.push(consumeAuthReturn())
    router.refresh()
  }

  const numericCode = method !== 'backup'
  const submitDisabled = pending || !code.trim() || (numericCode && code.length !== 6) || (method === 'email' && !sent)

  return <form className="grid gap-4" onSubmit={verify}>
    <div className="grid grid-cols-3 gap-2" aria-label="Verification method">
      {methods.map(({ id, label, icon: Icon }) => <Button key={id} type="button" variant={method === id ? 'primary' : 'secondary'} size="xs" className="min-w-0 px-2" onClick={() => chooseMethod(id)} aria-pressed={method === id} disabled={pending}>
        <Icon size={14}/><span className="truncate">{label}</span>
      </Button>)}
    </div>

    {method === 'totp' && <FormMessage>Enter the current six-digit code from your authenticator app.</FormMessage>}
    {method === 'email' && <><FormMessage>{sent ? `A code was sent to ${context.user.email}.` : 'Sending a one-time code to your verified email…'}</FormMessage>{sent && <Button className="w-full" type="button" variant="secondary" onClick={sendEmailCode} disabled={pending || secondsUntilResend > 0}>{secondsUntilResend > 0 ? `Resend in ${secondsUntilResend}s` : 'Resend email code'}</Button>}</>}
    {method === 'backup' && <FormMessage>Use one of the single-use recovery codes you saved during setup.</FormMessage>}

    <Field
      id="code"
      name="code"
      label={method === 'backup' ? 'Recovery code' : 'Six-digit security code'}
      inputMode={numericCode ? 'numeric' : 'text'}
      pattern={numericCode ? '[0-9]{6}' : undefined}
      autoComplete="one-time-code"
      value={code}
      onChange={(event) => setCode(numericCode ? event.target.value.replace(/\D/g, '').slice(0, 6) : event.target.value)}
      required
    />
    <label className="flex items-center gap-2.5 text-[.84rem] text-iq-600"><input type="checkbox" checked={trustDevice} onChange={(event) => setTrustDevice(event.target.checked)} className="size-4 accent-brand"/>Trust this device for 30 days</label>
    {error && <FormMessage tone="error">{error}</FormMessage>}
    <Button className="w-full" type="submit" disabled={submitDisabled}>{pending ? 'Checking…' : 'Verify identity'}</Button>
  </form>
}
