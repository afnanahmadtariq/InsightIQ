import type { Metadata } from 'next'
import { ForgotPasswordForm } from '../../components/account-actions'
import { AuthShell } from '../../components/auth-shell'
export const metadata: Metadata = { title: 'Reset password · InsightIQ' }
export default function Page() { return <AuthShell mode="sign-in"><h2>Reset your password</h2><p>We will send a secure, time-limited link to your verified email.</p><ForgotPasswordForm/></AuthShell> }
