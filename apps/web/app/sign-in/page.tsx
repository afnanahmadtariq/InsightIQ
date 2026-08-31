import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '../../components/auth-form'
import { AuthShell } from '../../components/auth-shell'

export const metadata: Metadata = { title: 'Sign in · InsightIQ' }
export default function SignInPage() { return <AuthShell mode="sign-in"><h2>Sign in to InsightIQ</h2><p>New here? <Link href="/sign-up">Create an account</Link></p><AuthForm mode="sign-in"/></AuthShell> }
