import { expect, test } from '@playwright/test'
import { e2eFixtures } from './fixtures.mjs'

const apiURL = (process.env.PLAYWRIGHT_API_URL || `http://127.0.0.1:${process.env.E2E_API_PORT || 3001}`).replace(/\/+$/, '')
const webURL = `http://127.0.0.1:${process.env.E2E_WEB_PORT || 3000}`

test('clear all removes every notification from the panel', async ({ page, request }) => {
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

  let clearRequested = false
  await page.route('**/notifications', async (route) => {
    const headers = {
      'Access-Control-Allow-Origin': webURL,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,DELETE,OPTIONS',
      'Content-Type': 'application/json',
    }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (route.request().method() === 'DELETE') {
      clearRequested = true
      return route.fulfill({ status: 200, headers, json: { cleared: 2 } })
    }
    return route.fulfill({ status: 200, headers, json: [
      { id: 'notification-1', type: 'brief_ready', title: 'Brief ready', body: 'Your brief is ready to review.', readAt: null, createdAt: new Date().toISOString(), researchRun: null },
      { id: 'notification-2', type: 'research_update', title: 'Research updated', body: 'New evidence was found.', readAt: new Date().toISOString(), createdAt: new Date().toISOString(), researchRun: null },
    ] })
  })

  await page.goto('/dashboard')
  await page.getByRole('button', { name: '1 unread notifications' }).click()
  await expect(page.getByRole('button', { name: 'Clear all' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear all' }).click()

  await expect(page.getByText('No notifications yet.')).toBeVisible()
  await expect(page.getByRole('button', { name: '0 unread notifications' })).toBeVisible()
  expect(clearRequested).toBeTruthy()
})

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
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Account menu' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 1280, height: 720 })
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

  await expect(page.getByRole('heading', { name: 'Connect the signal to your offer' })).toBeVisible()
  await expect(page.getByRole('tabpanel')).toContainText('Hypothesis to validate')
  await expect(page.getByRole('tabpanel')).toContainText(e2eFixtures.citation.claim)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('tab').first().click()
  await expect(page.getByRole('tabpanel')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.setViewportSize({ width: 1280, height: 720 })
  await expect(page.getByText('1 cited signal selected from 2 collected claims')).toBeVisible()
  await expect(page.getByText('An unrelated historical company fact.')).toHaveCount(0)
  await page.getByRole('button', { name: /^View source 1:/ }).click()
  await expect(page.getByTestId('evidence-disclosure')).toHaveAttribute('open', '')
  await expect(page.locator('article[id^="evidence-"]').first()).toBeFocused()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download brief' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('InsightIQ-meeting-brief.txt')
  const citation = page.locator(`a[href="${e2eFixtures.citation.url}"]`)
  await expect(citation.first()).toBeVisible()
  await expect(citation.first()).toHaveAttribute('target', '_blank')

  await page.getByRole('button', { name: 'Refresh brief' }).click()
  await expect(page.getByText('Meeting brief · Refreshing')).toBeVisible()
  await expect(page.getByText('1 claim used in this brief')).toBeVisible()
  await expect(page.getByText('Meeting brief · Ready')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('Changes since last refresh')).toBeVisible()
})
