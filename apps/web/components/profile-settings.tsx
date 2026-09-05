'use client'

import { CheckCircle2, KeyRound, LockKeyhole, ShieldCheck, ShieldOff, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useState, type FormEvent } from 'react'
import type { AccountContext, WorkspaceSummary } from '../lib/account-context'
import { authClient } from '../lib/auth-client'
import { Button } from './ui/button'
import { CopyButton } from './ui/copy-button'
import { Field } from './ui/form-field'
import { FormMessage } from './ui/form-message'

type SetupDetails = {
  totpURI: string
  backupCodes: string[]
}

type PendingAction = 'enable' | 'verify' | 'disable' | 'recovery' | null

function getMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback
}

function RecoveryCodes({ codes, regenerated = false }: { codes: string[]; regenerated?: boolean }) {
  return <div className="grid gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4">
    <div className="flex items-start gap-3">
      <KeyRound className="mt-0.5 shrink-0 text-amber-700" size={18}/>
      <div><h3 className="m-0 text-[.9rem] text-iq-900">Save your recovery codes now</h3><p className="mt-1 mb-0 text-[.78rem] leading-[1.5] text-iq-600">Each code works once. {regenerated ? 'Your previous recovery codes no longer work.' : 'Keep them somewhere safe outside InsightIQ.'}</p></div>
    </div>
    <div className="grid grid-cols-2 gap-2 max-[520px]:grid-cols-1">{codes.map((code) => <code key={code} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-center text-[.82rem] font-semibold tracking-[.08em] text-iq-900">{code}</code>)}</div>
    <div><CopyButton value={codes.join('\n')} label="Copy all codes"/></div>
  </div>
}

export function ProfileSettings({ user, workspace }: { user: AccountContext['user']; workspace: WorkspaceSummary }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(user.twoFactorEnabled)
  const [setup, setSetup] = useState<SetupDetails | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [setupPassword, setSetupPassword] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [pending, setPending] = useState<PendingAction>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
const initials = user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const secret = (() => {
  if (!setup) return ''
  try {
    return new URL(setup.totpURI).searchParams.get('secret') || ''
  } catch {
    return ''
  }
})()
  function begin(action: Exclude<PendingAction, null>) {
    setPending(action)
    setError('')
    setSuccess('')
  }

  async function enableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    begin('enable')
    const result = await authClient.twoFactor.enable({
      method: 'totp',
      password: user.hasPassword ? setupPassword : undefined,
    })

    if (result.error) setError(getMessage(result.error, 'Two-factor setup could not be started.'))
    else if (result.data?.method === 'totp') setSetup(result.data)
    else setError('Authenticator setup was not returned. Please try again.')
    setPending(null)
  }

  async function verifySetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!setup) return
    begin('verify')
    const result = await authClient.twoFactor.verifyTotp({ code: totpCode })

    if (result.error) {
      setError(getMessage(result.error, 'That authenticator code is not valid.'))
      setPending(null)
      return
    }

    setEnabled(true)
    setRecoveryCodes(setup.backupCodes)
    setSetup(null)
    setSetupPassword('')
    setTotpCode('')
    setSuccess('Two-factor authentication is now enabled.')
    setPending(null)
    router.refresh()
  }

  async function disableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    begin('disable')
    const result = await authClient.twoFactor.disable({ password: user.hasPassword ? disablePassword : undefined })

    if (result.error) {
      setError(getMessage(result.error, 'Two-factor authentication could not be disabled.'))
      setPending(null)
      return
    }

    setEnabled(false)
    setRecoveryCodes([])
    setDisablePassword('')
    setSuccess('Two-factor authentication has been disabled.')
    setPending(null)
    router.refresh()
  }

  async function regenerateRecoveryCodes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    begin('recovery')
    const result = await authClient.twoFactor.generateBackupCodes({ password: user.hasPassword ? recoveryPassword : undefined })

    if (result.error) {
      setError(getMessage(result.error, 'New recovery codes could not be generated.'))
      setPending(null)
      return
    }

    setRecoveryCodes(result.data?.backupCodes || [])
    setRecoveryPassword('')
    setSuccess('New recovery codes generated. Your previous codes are no longer valid.')
    setPending(null)
  }

  return <div className="grid gap-[18px]">
    <section className="rounded-[17px] border border-iq-200 bg-white p-[23px]">
      <div className="flex items-center gap-4 max-[520px]:items-start">
        <span className="grid size-14 shrink-0 place-items-center rounded-[17px] bg-[linear-gradient(135deg,#dff3ff,#dce8ff)] text-base font-bold text-iq-900">{initials || <UserRound size={22}/>}</span>
        <div className="min-w-0 flex-1"><h2 className="m-0 truncate text-[1.15rem] tracking-[-.02em] text-iq-900">{user.name}</h2><p className="mt-1 mb-0 truncate text-[.84rem] text-iq-500">{user.email}</p></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[.7rem] font-semibold ${user.emailVerified ? 'bg-[#eef9f3] text-success' : 'bg-amber-50 text-amber-700'}`}><CheckCircle2 size={13}/>{user.emailVerified ? 'Email verified' : 'Email unverified'}</span>
      </div>
      <dl className="mt-5 mb-0 grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
        <div className="rounded-xl bg-iq-50 p-3.5"><dt className="text-[.67rem] tracking-[.08em] text-iq-500 uppercase">Workspace</dt><dd className="mt-1 mb-0 text-sm font-semibold text-iq-900">{workspace.name}</dd></div>
        <div className="rounded-xl bg-iq-50 p-3.5"><dt className="text-[.67rem] tracking-[.08em] text-iq-500 uppercase">Role</dt><dd className="mt-1 mb-0 text-sm font-semibold text-iq-900">{workspace.role.toLowerCase().replace(/^./, (letter) => letter.toUpperCase())}</dd></div>
      </dl>
    </section>

    <section className="rounded-[17px] border border-iq-200 bg-white p-[23px]">
      <header className="flex items-start justify-between gap-4 border-b border-iq-100 pb-5">
        <div className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${enabled ? 'bg-[#eef9f3] text-success' : 'bg-iq-100 text-brand'}`}>{enabled ? <ShieldCheck size={20}/> : <LockKeyhole size={20}/>}</span><div><h2 className="m-0 text-[1.08rem] text-iq-900">Two-factor authentication</h2><p className="mt-1 mb-0 text-[.8rem] leading-[1.5] text-iq-500">Protect your account with an authenticator app, email fallback, and recovery codes.</p></div></div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[.7rem] font-semibold ${enabled ? 'bg-[#eef9f3] text-success' : 'bg-iq-100 text-iq-600'}`}>{enabled ? 'Enabled' : 'Not enabled'}</span>
      </header>

      <div className="mt-5 grid gap-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}
        {success && <FormMessage tone="success">{success}</FormMessage>}

        {!enabled && !setup && <form className="grid max-w-[520px] gap-4" onSubmit={enableTwoFactor}>
          <div><h3 className="m-0 text-[.94rem] text-iq-900">Set up an authenticator app</h3><p className="mt-1.5 mb-0 text-[.8rem] leading-[1.55] text-iq-500">Use Google Authenticator, 1Password, Authy, or another app that supports time-based codes.</p></div>
          {user.hasPassword && <Field id="setup-password" name="password" type="password" label="Current password" autoComplete="current-password" value={setupPassword} onChange={(event) => setSetupPassword(event.target.value)} required/>}
          {!user.hasPassword && <FormMessage>Your account uses social sign-in, so your current protected session confirms this change.</FormMessage>}
          <div><Button type="submit" size="sm" disabled={pending === 'enable' || (user.hasPassword && !setupPassword)}>{pending === 'enable' ? 'Starting setup…' : 'Set up authenticator'}</Button></div>
        </form>}

        {!enabled && setup && <div className="grid gap-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 max-[620px]:grid-cols-1">
            <div className="w-fit rounded-[14px] border border-iq-200 bg-white p-3"><QRCodeSVG value={setup.totpURI} size={174} level="M" marginSize={1}/></div>
            <div className="grid content-start gap-3"><div><h3 className="m-0 text-[.94rem] text-iq-900">Scan this QR code</h3><p className="mt-1.5 mb-0 text-[.8rem] leading-[1.55] text-iq-500">Open your authenticator app, add an account, then scan the code. Enter the six-digit code below to finish.</p></div>{secret && <div className="grid gap-2"><span className="text-[.72rem] font-semibold text-iq-600">Can’t scan it? Enter this setup key:</span><div className="flex items-center gap-2 rounded-xl bg-iq-50 p-2.5"><code className="min-w-0 flex-1 break-all text-[.76rem] font-semibold tracking-[.06em] text-iq-900">{secret}</code><CopyButton value={secret}/></div></div>}</div>
          </div>
          <form className="grid max-w-[520px] gap-4" onSubmit={verifySetup}>
            <Field id="totp-code" name="code" label="Six-digit authenticator code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" value={totpCode} onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required/>
            <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={pending === 'verify' || totpCode.length !== 6}>{pending === 'verify' ? 'Verifying…' : 'Verify and enable'}</Button><Button type="button" size="sm" variant="ghost" onClick={() => { setSetup(null); setTotpCode(''); setError('') }} disabled={pending !== null}>Cancel</Button></div>
          </form>
        </div>}

        {enabled && <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1"><div className="rounded-xl bg-iq-50 p-3.5"><h3 className="m-0 text-[.85rem] text-iq-900">Authenticator app</h3><p className="mt-1 mb-0 text-[.75rem] leading-[1.5] text-iq-500">Use a rotating six-digit code when you sign in.</p></div><div className="rounded-xl bg-iq-50 p-3.5"><h3 className="m-0 text-[.85rem] text-iq-900">Email fallback</h3><p className="mt-1 mb-0 text-[.75rem] leading-[1.5] text-iq-500">Request a verified email code if the app is unavailable.</p></div></div>
          {recoveryCodes.length > 0 && <RecoveryCodes codes={recoveryCodes} regenerated={success.startsWith('New recovery')}/>}

          <div className="grid grid-cols-2 gap-4 border-t border-iq-100 pt-5 max-[720px]:grid-cols-1">
            <form className="grid content-start gap-3 rounded-[14px] border border-iq-200 p-4" onSubmit={regenerateRecoveryCodes}>
              <div><h3 className="m-0 text-[.9rem] text-iq-900">Replace recovery codes</h3><p className="mt-1 mb-0 text-[.76rem] leading-[1.5] text-iq-500">Generate a fresh set if your saved codes are lost or exposed.</p></div>
              {user.hasPassword && <Field id="recovery-password" name="password" type="password" label="Current password" autoComplete="current-password" value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} required/>}
              <div><Button type="submit" variant="secondary" size="xs" disabled={pending !== null || (user.hasPassword && !recoveryPassword)}>{pending === 'recovery' ? 'Generating…' : 'Generate new codes'}</Button></div>
            </form>
            <form className="grid content-start gap-3 rounded-[14px] border border-danger/20 bg-[#fffafb] p-4" onSubmit={disableTwoFactor}>
              <div><h3 className="m-0 text-[.9rem] text-iq-900">Disable two-factor authentication</h3><p className="mt-1 mb-0 text-[.76rem] leading-[1.5] text-iq-500">Your account will return to password or social sign-in only.</p></div>
              {user.hasPassword && <Field id="disable-password" name="password" type="password" label="Current password" autoComplete="current-password" value={disablePassword} onChange={(event) => setDisablePassword(event.target.value)} required/>}
              <div><Button type="submit" variant="danger" size="xs" disabled={pending !== null || (user.hasPassword && !disablePassword)}><ShieldOff size={15}/>{pending === 'disable' ? 'Disabling…' : 'Disable 2FA'}</Button></div>
            </form>
          </div>
        </div>}
      </div>
    </section>
  </div>
}
