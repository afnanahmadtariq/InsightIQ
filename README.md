# InsightIQ

Evidence-first AI sales intelligence for researching prospects, connecting public signals to an offer, and producing verifiable deal briefs.

## Repository

- `apps/web`: Next.js landing page, authentication, workspace onboarding, research workflow, evidence library, deal briefs, notifications, and integration readiness.
- `apps/api`: NestJS authentication, account context, tenant-scoped research actions, discovery, and cross-run libraries.
- `apps/worker`: Python process that claims `research_run` rows from PostgreSQL after discovery has stored sources.
- `packages/db`: Prisma/PostgreSQL identity, workspace, research, evidence, brief, and notification models.
- `nginx`: production API reverse proxy.

## Local setup

```bash
cp .env.example .env
npm install
npm run worker:setup   # creates apps/worker/.venv (requires Python 3)
docker compose up -d postgres
npm run db:migrate:dev
npm run dev
```

Worker setup is explicit so JavaScript-only installs and deployment CI do not require Python. Re-run `npm run worker:setup` after changing worker dependencies; API or frontend-only development can skip it.

The worker uses **psycopg**, **Pydantic**, **LangGraph**, **httpx**, **BeautifulSoup**, and optional **Crawl4AI** (`WORKER_USE_CRAWL4AI=true`) to enrich sources, extract citable claims, and synthesize deal briefs. To prove collection without the database:

```bash
npm run worker:setup
apps/worker/.venv/bin/python -m insightiq_worker.demo --prospect "Tim Cook" --company "Apple"
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:3001` by default. Turbo also starts `@insightiq/worker`, which polls PostgreSQL for runs that already have sources.

## Quality pipeline

```bash
npm run clean
npm run build
npm run lint
npm run check-types
npm test
```

`clean` runs the workspace cleanup tasks through Turbo and uses `rimraf` for cross-platform artifact removal.

## Authentication and workspaces

InsightIQ uses Better Auth with email verification, password reset, optional Google OAuth, optional two-factor authentication, secure sessions, and organization-backed workspaces. Every product query resolves the active membership before reading or writing tenant data.

Landing-page signups stay in `WaitlistSignup` and are never treated as authenticated users; the unused scaffolded `User` table was dropped when the Better Auth identity tables were introduced.

Production requires at least:

- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `PRIMARY_DOMAIN` and `API_DOMAIN`
- database and deployment variables already listed in `.env.example`

Set `TAVILY_API_KEY` for reliable production web discovery. Tavily's SDK supports
keyless local evaluation with a shared limit; `TAVILY_PROJECT_ID`, search depth,
and per-query result count are optional and documented in `.env.example`.

## Research foundation

`POST /research-runs` accepts prospect identifiers, an offer/value proposition, and either a meeting or outreach goal. It atomically creates the prospect, offer, immutable input snapshot, and queued research run inside the active workspace.

The schema is ready for asynchronous workers to add:

- source records with retrieval metadata;
- normalized evidence claims tied to a source;
- a generated deal brief tied to one run;
- in-app completion notifications.

Compound workspace keys prevent a run, source, evidence claim, or brief from being linked across tenants.

`POST /research-runs/:id/discover` claims one queued run and performs focused
prospect, company, and recent-signal searches through the project-local Tavily
SDK. Searches run in parallel, tracking parameters are removed, duplicate URLs
are merged, and provider request metadata is preserved on each source. Discovery
leaves the run in `running` so later evidence extraction and synthesis workers can
finish it; provider failures move the run to `failed`.

The authenticated product flow and the contracts for the next workers are
documented in [`docs/user-flows.md`](docs/user-flows.md). Current supporting
endpoints include:

- `POST /research-runs/:id/retry` to safely return failed runs to the queue;
- `GET /evidence` for workspace sources and normalized claims;
- `GET /deal-briefs` and `GET /deal-briefs/:id` for synthesized outputs;
- `GET /notifications` and `POST /notifications/:id/read` for in-app delivery;
- `GET /integrations` for non-secret pipeline readiness.

## Deployment

Production workflows run only for version tags matching `v*`; pull requests run verification without deploying.

```bash
git tag v0.1.0
git push origin v0.1.0
```

The API deployment starts PostgreSQL, runs migrations as a one-off command, starts the backend without forced recreation, then recreates Nginx separately and verifies all services before pruning unused images.
