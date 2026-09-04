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
  await expect(page.getByRole('heading', { name: 'Your next conversation starts here.' })).toBeVisible({ timeout: 15_000 })
  await page.goto('/dashboard/research/new')

  await page.getByLabel('Prospect name').fill(e2eFixtures.prospect.name)
  await page.getByLabel('Company', { exact: true }).fill(e2eFixtures.prospect.companyName)
  await page.getByLabel('Offer', { exact: true }).fill(e2eFixtures.offer.name)
  await page.getByLabel('Best-fit buyer').fill(e2eFixtures.offer.persona)
  await page.getByLabel('Problem you solve and outcome you create').fill(e2eFixtures.offer.context)
  await page.getByRole('button', { name: 'Build meeting brief' }).click()

  await expect(page).toHaveURL(/\/dashboard\/research\/.+/)
  await expect(page.getByRole('link', { name: 'Use this brief' }).first()).toBeVisible({ timeout: 20_000 })

  await page.getByRole('link', { name: 'Use this brief' }).first().click()
  await expect(page).toHaveURL(/\/dashboard\/briefs\/.+/)

  await page.getByText('Sources & confidence').click()
  const citation = page.locator(`a[href="${e2eFixtures.citation.url}"]`)
  await expect(citation.first()).toBeVisible()
  await expect(citation.first()).toHaveAttribute('target', '_blank')
})
