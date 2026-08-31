import type { ReactNode } from 'react'
import { requireWorkspace } from '../../lib/server-auth'
export default async function DashboardLayout({ children }: { children: ReactNode }) { await requireWorkspace(); return children }
