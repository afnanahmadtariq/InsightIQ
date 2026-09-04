import { expect, test } from '@playwright/test'
import { e2eFixtures } from './fixtures.mjs'

const apiURL = (process.env.PLAYWRIGHT_API_URL || `http://127.0.0.1:${process.env.E2E_API_PORT || 3001}`).replace(/\/+$/, '')
const webURL = `http://127.0.0.1:${process.env.E2E_WEB_PORT || 3000}`

test('sign-in, create research run, open cited brief', async ({ page, request }) => {
  const signIn = await request.post(`${apiURL}/api/auth/sign-in/email`, {
    data: { email: e2eFixtures.user.email, password: e2eFixtures.user.password },
  })
  expect(signIn.ok()).toBeTruthy()
  const auth = await signIn.json() as { token: string }
  const cookie = {
    name: 'insightiq.session_token',
    value: auth.token,
    httpOnly: true,
    sameSite: 'Lax' as const,
  }
  await page.context().addCookies([
    { ...cookie, url: webURL },
    { ...cookie, url: apiURL },
  ])

  await page.goto('/dashboard')
  await expect(page.getByText('Intelligence workspace')).toBeVisible({ timeout: 15_000 })
  await page.goto('/dashboard/research/new')

  await page.getByLabel('Prospect name').fill(e2eFixtures.prospect.name)
  await page.getByLabel('Company (optional)').fill(e2eFixtures.prospect.companyName)
  await page.getByLabel('Offer name').fill(e2eFixtures.offer.name)
  await page.getByLabel('Target persona (optional)').fill(e2eFixtures.offer.persona)
  await page.getByLabel('Value proposition and context').fill(e2eFixtures.offer.context)
  await page.getByRole('button', { name: 'Start research run' }).click()

  await expect(page).toHaveURL(/\/dashboard\/research\/.+/)
  await expect(page.getByRole('link', { name: 'Open deal brief' }).first()).toBeVisible({ timeout: 20_000 })

  await page.getByRole('link', { name: 'Open deal brief' }).first().click()
  await expect(page).toHaveURL(/\/dashboard\/briefs\/.+/)

  const citation = page.locator(`a[href="${e2eFixtures.citation.url}"]`)
  await expect(citation.first()).toBeVisible()
  await expect(citation.first()).toHaveAttribute('target', '_blank')
})
