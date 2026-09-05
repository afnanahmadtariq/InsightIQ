export interface WorkspaceSettingsContext {
  currentUserId: string
  workspace: {
    id: string
    name: string
    slug: string
    role: string
    isAdmin: boolean
  }
  members: Array<{
    id: string
    role: string
    joinedAt: string
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
  }>
  invitations: Array<{
    id: string
    email: string
    role?: string | null
    status: string
    expiresAt: string
    createdAt: string
  }>
}
