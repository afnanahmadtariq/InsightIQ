import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '../../components/auth-form'
import { AuthShell } from '../../components/auth-shell'

export const metadata: Metadata = { title: 'Create account · InsightIQ' }
export default function SignUpPage() { return <AuthShell mode="sign-up"><h2>Create your account</h2><p>Already using InsightIQ? <Link href="/sign-in">Sign in</Link></p><AuthForm mode="sign-up"/></AuthShell> }
