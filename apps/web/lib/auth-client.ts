'use client'

import { organizationClient, twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { API_URL } from './api-client'

export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: '/api/auth',
  fetchOptions: { credentials: 'include' },
  plugins: [
    twoFactorClient({ twoFactorPage: '/two-factor' }),
    organizationClient(),
  ],
})

export function webCallbackURL(path: string) {
  return new URL(path, window.location.origin).toString()
}
