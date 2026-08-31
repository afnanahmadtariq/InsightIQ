# InsightIQ

Evidence-first AI sales intelligence for researching prospects, connecting public signals to an offer, and producing verifiable deal briefs.

## Repository

- `apps/web`: Next.js landing page, authentication, workspace onboarding, dashboard, and research intake.
- `apps/api`: NestJS authentication, account context, and tenant-scoped research APIs.
- `packages/db`: Prisma/PostgreSQL identity, workspace, research, evidence, brief, and notification models.
- `nginx`: production API reverse proxy.

## Local setup

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate:dev
npm run dev
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:3001` by default.

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

## Research foundation

`POST /research-runs` accepts prospect identifiers, an offer/value proposition, and either a meeting or outreach goal. It atomically creates the prospect, offer, immutable input snapshot, and queued research run inside the active workspace.

The schema is ready for asynchronous workers to add:

- source records with retrieval metadata;
- normalized evidence claims tied to a source;
- a generated deal brief tied to one run;
- in-app completion notifications.

Compound workspace keys prevent a run, source, evidence claim, or brief from being linked across tenants.

## Deployment

Production workflows run only for version tags matching `v*`; pull requests run verification without deploying.

```bash
git tag v0.1.0
git push origin v0.1.0
```

The API deployment starts PostgreSQL, runs migrations as a one-off command, starts the backend without forced recreation, then recreates Nginx separately and verifies all services before pruning unused images.
