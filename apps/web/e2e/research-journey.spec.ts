import { expect, test } from '@playwright/test'

const apiURL = (process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
const e2eSecret = process.env.E2E_SEED_SECRET || 'e2e-local-secret-ok'

test.describe.configure({ mode: 'serial' })

test('seeded auth to cited brief journey', async ({ page, request }) => {
  let seedResponse
  try {
    seedResponse = await request.post(`${apiURL}/e2e/seed`, {
      headers: { 'x-e2e-secret': e2eSecret },
    })
  } catch {
    test.skip(true, 'API unavailable for e2e seed')
    return
  }
  if (seedResponse.status() === 404) {
    test.skip(true, 'E2E seed endpoint is disabled — set E2E_USE_REAL_STACK=true with Postgres')
    return
  }
  expect(seedResponse.ok()).toBeTruthy()

  const seed = await seedResponse.json() as {
    email: string
    password: string
    runId: string
    briefId: string
    prospectName: string
    citationUrl: string
  }

  await page.goto('/sign-in')
  await page.getByLabel('Work email').fill(seed.email)
  await page.getByLabel('Password').fill(seed.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard**')

  await page.goto(`/dashboard/research/${seed.runId}`)
  await expect(page.getByRole('heading', { name: seed.prospectName })).toBeVisible()
  await expect(page.getByText('Research complete').or(page.getByText('Deal brief ready'))).toBeVisible()

  await page.goto(`/dashboard/briefs/${seed.briefId}`)
  const citation = page.locator(`a[href="${seed.citationUrl}"]`).first()
  await expect(citation).toBeVisible()
  await expect(citation).toHaveAttribute('target', '_blank')
})
