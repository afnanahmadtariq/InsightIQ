import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { e2eFixtures } from './fixtures.mjs'

const PORT = Number(process.env.E2E_API_PORT || 3001)
const SESSION_COOKIE = 'insightiq.session_token'
const WEB_ORIGIN = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${process.env.E2E_WEB_PORT || 3000}`

const corsHeaders = {
  'Access-Control-Allow-Origin': WEB_ORIGIN,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const state = { sessions: new Map(), runs: new Map(), pollCounts: new Map() }

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders, ...headers })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch (error) { reject(error) }
    })
    req.on('error', reject)
  })
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
      const index = part.indexOf('=')
      return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))]
    }),
  )
}

function sessionFromRequest(req) {
  const token = parseCookies(req)[SESSION_COOKIE]
  return token ? state.sessions.get(token) || null : null
}

function setSessionCookie(token) {
  return [`${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`]
}

function userPayload() {
  return {
    id: 'e2e-user-id',
    name: e2eFixtures.user.name,
    email: e2eFixtures.user.email,
    emailVerified: true,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    twoFactorEnabled: false,
  }
}

function accountContext() {
  const workspace = { ...e2eFixtures.workspace, logo: null }
  return {
    user: { ...userPayload(), hasPassword: true },
    workspaces: [workspace],
    activeWorkspace: workspace,
    requirements: { requiresOnboarding: false, requiresWorkspaceSelection: false, requiresTwoFactorChallenge: false },
    destination: '/dashboard',
  }
}

function sourceForRun(runId) {
  return {
    id: `${runId}-source`,
    url: e2eFixtures.citation.url,
    title: e2eFixtures.citation.title,
    publisher: e2eFixtures.citation.publisher,
    sourceType: e2eFixtures.citation.sourceType,
    excerpt: e2eFixtures.citation.claim,
    publishedAt: null,
    retrievedAt: new Date().toISOString(),
  }
}

function evidenceForRun(runId) {
  const source = sourceForRun(runId)
  return [{
    id: `${runId}-evidence`,
    claim: e2eFixtures.citation.claim,
    signalType: e2eFixtures.citation.signalType,
    confidence: 0.91,
    source,
  }]
}

function runDetail(run, phase) {
  return {
    id: run.id,
    status: phase === 'completed' ? 'completed' : 'running',
    goal: run.goal,
    requestedAt: run.requestedAt,
    startedAt: run.requestedAt,
    completedAt: phase === 'completed' ? new Date().toISOString() : null,
    errorMessage: null,
    prospect: run.prospect,
    offer: run.offer,
    sources: phase === 'queued' ? [] : [sourceForRun(run.id)],
    evidence: phase === 'completed' ? evidenceForRun(run.id) : [],
    brief: phase === 'completed' ? {
      id: `${run.id}-brief`,
      title: `Deal brief · ${run.prospect.name}`,
      status: 'ready',
      updatedAt: new Date().toISOString(),
    } : null,
  }
}

function createSession(activeOrganizationId = e2eFixtures.workspace.id) {
  const token = randomUUID()
  state.sessions.set(token, { activeOrganizationId })
  return token
}

function ensureAuthenticated(req, res) {
  const session = sessionFromRequest(req)
  if (!session) { json(res, 401, { message: 'Unauthorized' }); return null }
  return session
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)
  const { pathname } = url

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders)
      return res.end()
    }
    if (req.method === 'GET' && pathname === '/health') return json(res, 200, { status: 'ok' })
    if (req.method === 'GET' && pathname === '/auth-config') return json(res, 200, { googleEnabled: false })
    if (req.method === 'GET' && pathname === '/notifications') {
      if (!ensureAuthenticated(req, res)) return
      return json(res, 200, [])
    }
    if (req.method === 'GET' && pathname === '/account-context') {
      if (!ensureAuthenticated(req, res)) return
      return json(res, 200, accountContext())
    }
    if (req.method === 'GET' && pathname === '/research-runs') {
      if (!ensureAuthenticated(req, res)) return
      return json(res, 200, [...state.runs.values()].map((run) => ({
        ...runDetail(run, run.status === 'completed' ? 'completed' : 'running'),
        _count: { sources: 1, evidence: run.status === 'completed' ? 1 : 0 },
      })))
    }

    if (pathname.startsWith('/api/auth/')) {
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method || '') ? await readBody(req) : {}
      if (req.method === 'POST' && pathname === '/api/auth/sign-in/email') {
        if (body.email !== e2eFixtures.user.email || body.password !== e2eFixtures.user.password) {
          return json(res, 401, { message: 'Invalid email or password' })
        }
        const token = createSession()
        return json(res, 200, { token, user: userPayload(), redirect: false }, { 'Set-Cookie': setSessionCookie(token) })
      }
      if ((req.method === 'GET' || req.method === 'POST') && pathname === '/api/auth/get-session') {
        const session = sessionFromRequest(req)
        if (!session) return json(res, 200, null)
        return json(res, 200, {
          session: {
            id: 'e2e-session-id',
            token: 'e2e-session-token',
            userId: 'e2e-user-id',
            activeOrganizationId: session.activeOrganizationId,
            expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          user: userPayload(),
        })
      }
      if (req.method === 'POST' && pathname === '/api/auth/sign-out') {
        return json(res, 200, { success: true }, { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0` })
      }
      return json(res, 404, { message: `Unhandled auth route ${pathname}` })
    }

    if (req.method === 'POST' && pathname === '/research-runs') {
      if (!ensureAuthenticated(req, res)) return
      const body = await readBody(req)
      const id = randomUUID()
      const run = {
        id,
        status: 'running',
        goal: body.goal || 'meeting',
        requestedAt: new Date().toISOString(),
        prospect: {
          name: body.prospectName,
          email: body.prospectEmail || null,
          companyName: body.companyName || null,
          companyDomain: body.companyDomain || null,
          linkedinUrl: body.linkedinUrl || null,
          xHandle: body.xHandle || null,
        },
        offer: {
          name: body.offerName,
          valueProposition: body.offerContext,
          targetPersona: body.targetPersona || null,
        },
      }
      state.runs.set(id, run)
      state.pollCounts.set(id, 0)
      return json(res, 201, runDetail(run, 'running'))
    }

    if (req.method === 'GET' && pathname.startsWith('/research-runs/')) {
      if (!ensureAuthenticated(req, res)) return
      const id = pathname.split('/')[2]
      const run = state.runs.get(id)
      if (!run) return json(res, 404, { message: 'Research run not found' })
      const polls = (state.pollCounts.get(id) || 0) + 1
      state.pollCounts.set(id, polls)
      const phase = polls >= 1 ? 'completed' : 'running'
      run.status = phase
      return json(res, 200, runDetail(run, phase))
    }

    if (req.method === 'GET' && pathname.startsWith('/deal-briefs/')) {
      if (!ensureAuthenticated(req, res)) return
      const briefId = pathname.split('/')[2]
      const run = [...state.runs.values()].find((item) => `${item.id}-brief` === briefId)
      if (!run) return json(res, 404, { message: 'Deal brief not found' })
      const detail = runDetail(run, 'completed')
      return json(res, 200, {
        id: briefId,
        title: `Deal brief · ${run.prospect.name}`,
        status: 'ready',
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: {
          summary: `${detail.evidence[0]?.claim || e2eFixtures.citation.claim} Use this verified signal to test the prospect's current priority before positioning the offer.`,
          personalized_opener: `${run.prospect.name.split(' ')[0]}, I noticed the latest signal at ${run.prospect.companyName}. How is that shaping priorities right now?`,
          talking_points: ['Lead with the verified signal, then validate whether it maps to an active priority.'],
          questions_to_ask: ['What changed recently that made this conversation worth having?'],
          objection_handling: ['If timing is tight: agree on the event that would make this urgent.'],
          next_steps: ['Confirm one priority and the right owner for a focused follow-up.'],
        },
        researchRun: {
          id: detail.id,
          goal: detail.goal,
          prospect: detail.prospect,
          offer: detail.offer,
          evidence: detail.evidence,
        },
      })
    }

    if (req.method === 'GET' && pathname === '/deal-briefs') {
      if (!ensureAuthenticated(req, res)) return
      return json(res, 200, [])
    }

    return json(res, 404, { message: `Unhandled route ${req.method} ${pathname}` })
  } catch (error) {
    json(res, 500, { message: error instanceof Error ? error.message : 'Mock API failure' })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`e2e mock API listening on http://127.0.0.1:${PORT}\n`)
})
