'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '../lib/auth-client'
import { Button } from './ui'

export function SignOutButton() {
  const router = useRouter()
  return <Button variant="secondary" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh() }}><LogOut size={17}/>Sign out</Button>
}
