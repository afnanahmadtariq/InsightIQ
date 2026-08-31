export interface WorkspaceSummary {
  id: string
  name: string
  slug: string
  logo?: string | null
  role: string
}

export interface AccountContext {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    emailVerified: boolean
    twoFactorEnabled: boolean
    hasPassword: boolean
  }
  workspaces: WorkspaceSummary[]
  activeWorkspace: WorkspaceSummary | null
  requirements: {
    requiresOnboarding: boolean
    requiresWorkspaceSelection: boolean
    requiresTwoFactorChallenge: boolean
  }
  destination: string
}
