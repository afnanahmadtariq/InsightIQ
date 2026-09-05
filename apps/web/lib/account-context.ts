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
    authenticatorAppEnabled: boolean
    hasPassword: boolean
  }
  workspaces: WorkspaceSummary[]
  activeWorkspace: WorkspaceSummary | null
  accountDeletion: {
    soleWorkspaceNames: string[]
  }
  requirements: {
    requiresOnboarding: boolean
    requiresWorkspaceSelection: boolean
    requiresTwoFactorChallenge: boolean
  }
  destination: string
}
