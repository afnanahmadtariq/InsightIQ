import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { db } from '@insightiq/db'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import { auth } from './auth'

export type AuthenticatedSession = UserSession<typeof auth>

@Injectable()
export class AccountContextService {
  async getContext(session: AuthenticatedSession) {
    const [memberships, passwordAccount] = await Promise.all([
      db.member.findMany({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.account.findFirst({
        where: { userId: session.user.id, providerId: 'credential' },
        select: { id: true },
      }),
    ])
    const workspaces = memberships.map(({ organization, role }) => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role,
    }))
    const activeWorkspace = workspaces.find((workspace) => workspace.id === session.session.activeOrganizationId) ?? null
    const requiresTwoFactorChallenge = Boolean(session.user.twoFactorEnabled && !session.session.mfaVerifiedAt)

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
        hasPassword: Boolean(passwordAccount),
      },
      workspaces,
      activeWorkspace,
      requirements: {
        requiresOnboarding: !workspaces.length,
        requiresWorkspaceSelection: workspaces.length > 0 && !activeWorkspace,
        requiresTwoFactorChallenge,
      },
      destination: requiresTwoFactorChallenge
        ? '/two-factor'
        : activeWorkspace
          ? '/dashboard'
          : '/onboarding',
    }
  }

  async assertActiveWorkspace(session: AuthenticatedSession) {
    const organizationId = session.session.activeOrganizationId
    if (!organizationId) throw new NotFoundException('Select a workspace before continuing')

    const membership = await db.member.findUnique({
      where: { organizationId_userId: { organizationId, userId: session.user.id } },
      include: { organization: true },
    })
    if (!membership) throw new ForbiddenException('The selected workspace is not available to this identity')
    if (session.user.twoFactorEnabled && !session.session.mfaVerifiedAt) {
      throw new ForbiddenException('Complete two-factor verification before continuing')
    }
    return membership
  }
}
