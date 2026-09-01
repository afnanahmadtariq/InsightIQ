'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '../lib/auth-client'
import { Button } from './ui'

export function SignOutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  return <Button variant="secondary" className={className} aria-label="Sign out" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh() }}><LogOut size={17}/><span>Sign out</span></Button>
}
