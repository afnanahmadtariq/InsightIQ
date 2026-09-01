'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '../lib/auth-client'
import { Button } from './ui/button'

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  return <Button variant="danger" size={compact ? 'icon' : 'sm'} className={compact ? 'self-center [&>span]:sr-only' : 'w-full'} aria-label="Sign out" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh() }}><LogOut size={17}/><span>Sign out</span></Button>
}
