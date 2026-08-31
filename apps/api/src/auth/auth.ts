import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@insightiq/db'
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { organization, twoFactor } from 'better-auth/plugins'
import { config as loadEnvironment } from 'dotenv'
import { basename, dirname, resolve } from 'node:path'
import { sendAuthEmail } from './auth-email'

const currentDirectory = process.cwd()
const workspaceRoot = basename(currentDirectory) === 'api' && basename(dirname(currentDirectory)) === 'apps'
  ? resolve(currentDirectory, '../..')
  : currentDirectory
loadEnvironment({ path: resolve(workspaceRoot, '.env') })

const isProduction = process.env.NODE_ENV === 'production'
const baseURL = process.env.BETTER_AUTH_URL?.trim() || 'http://localhost:3001'
const webOrigin = process.env.WEB_ORIGIN?.trim() || 'http://localhost:3000'
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || webOrigin)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim()

export const auth = betterAuth({
  appName: 'InsightIQ',
  baseURL,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET?.trim() || 'insightiq-development-secret-change-before-production',
  database: prismaAdapter(db, {
    provider: 'postgresql',
    transaction: true,
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => sendAuthEmail({
      to: user.email,
      kind: 'password-reset',
      title: 'Reset your InsightIQ password',
      message: 'Use the secure link below to choose a new password. The link expires in one hour.',
      actionUrl: url,
      actionLabel: 'Reset password',
    }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => sendAuthEmail({
      to: user.email,
      kind: 'verification',
      title: 'Verify your email',
      message: 'Confirm this email address to secure your InsightIQ workspace.',
      actionUrl: url,
      actionLabel: 'Verify email',
    }),
  },
  account: {
    accountLinking: { enabled: true },
  },
  socialProviders: googleClientId && googleClientSecret ? {
    google: { clientId: googleClientId, clientSecret: googleClientSecret },
  } : {},
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    additionalFields: {
      mfaVerifiedAt: { type: 'date', required: false, input: false },
    },
  },
  advanced: {
    database: { joins: true },
    cookiePrefix: 'insightiq',
    useSecureCookies: isProduction,
    ...(cookieDomain ? {
      crossSubDomainCookies: { enabled: true, domain: cookieDomain },
    } : {}),
  },
  hooks: {
    after: createAuthMiddleware(async (context) => {
      if (!['/two-factor/verify-totp', '/two-factor/verify-otp', '/two-factor/verify-backup-code'].includes(context.path)) return
      const session = context.context.newSession?.session ?? context.context.session?.session
      if (session?.id) {
        await db.session.update({ where: { id: session.id }, data: { mfaVerifiedAt: new Date() } })
      }
    }),
  },
  plugins: [
    twoFactor({
      issuer: 'InsightIQ',
      allowPasswordless: true,
      otpOptions: {
        period: 5,
        digits: 6,
        allowedAttempts: 5,
        storeOTP: 'hashed',
        sendOTP: async ({ user, otp }) => sendAuthEmail({
          to: user.email,
          kind: 'two-factor',
          title: 'Your InsightIQ security code',
          message: 'Enter this code to complete sign-in. It expires in five minutes.',
          code: otp,
        }),
      },
      accountLockout: { enabled: true, maxFailedAttempts: 8, durationSeconds: 15 * 60 },
    }),
    organization({
      allowUserToCreateOrganization: true,
      membershipLimit: 50,
      invitationLimit: 100,
      creatorRole: 'owner',
      disableOrganizationDeletion: true,
    }),
  ],
})

export type InsightIQAuthSession = typeof auth.$Infer.Session
