# Nginx (Load Balancer / Reverse Proxy)

Status: planning · Part of [Implementation Plans](./README.md)

## Current state

`nginx/templates/api.conf.template` already reverse-proxies one public domain
(`API_DOMAIN`/`api-insightiq.zerotools.online`) to a single `api` upstream, deployed via
`docker-compose.yml`'s `nginx` service and `.github/workflows/deploy-vps.yml`. The `web` frontend is
**not** served through this Nginx — it deploys separately to Cloudflare Workers via OpenNext
(`.github/workflows/deploy-cloudflare.yml`), and that split stays as-is; this plan only covers what
changes on the VPS/Nginx side as the single `api` service splits into the services from
[ADR 0005](../decisions/0005-event-driven-microservices-pivot.md).

## Responsibilities

- Terminate TLS for the public API domain and route requests to the Auth & User Management Service
  — the only backend service Nginx (or anything public) talks to directly.
- Load-balance across Auth service replicas once there is more than one (a stretch goal — the
  hackathon demo likely runs a single replica per service given the build window, but the config
  should not have to change shape to add replicas later).
- Never route directly to Billing, OSINT Workers, or AI Synthesis — those are internal-only, reached
  by the Auth service (HTTP) or Kafka, never by Nginx. This keeps the public attack surface to one
  service, which is also the one already covered by auth/session checks.

## Configuration plan

- Keep one `server` block on `API_DOMAIN`, upstream renamed from `api` to `auth_service` (matching
  the Auth & User Management Service's compose service name), proxying the same path space that
  service already owns (`/auth/*`, `/me`, `/workspaces/*`, `/research-runs/*`, `/accounts`).
- Add an `upstream auth_service { least_conn; server auth-service:3001; }` block so adding a second
  `server auth-service-2:3001;` line later is the only change needed to load-balance — no rewrite of
  the routing rules.
- No new public server block for Billing/OSINT/AI: they aren't reachable through Nginx at all, by
  design (see Responsibilities above). If a webhook receiver is ever needed (e.g. a Qoder billing
  webhook), it's added as a route on the Auth service, not a new public upstream, to avoid growing
  the public surface.
- TLS certs continue to come from `nginx/certs/` (already `.gitignore`d/`.gitkeep`-only in the repo,
  populated on the deploy target, not committed) — unchanged by this plan.

## Local development

`docker-compose.yml`'s `nginx` service is unchanged in shape (image, ports, volumes); only the
`API_DOMAIN` env var's target upstream needs the Auth service's compose name once that service is
split out/renamed. Local dev typically bypasses Nginx entirely (`apps/web` calls `localhost:3001`
directly via `NEXT_PUBLIC_API_URL`), so this mainly matters for the deployed environment.

## Build order

1. **Aug 28–29:** No change needed yet — the existing `api.conf.template` keeps working against
   whatever the Auth service is called during scaffolding.
2. **Aug 30–31:** Rename the upstream to `auth_service` once the Auth & User Management Service's
   compose entry is finalized; redeploy via the existing `deploy-vps.yml` workflow (already
   triggers on `nginx/**` and `docker-compose.yml` changes).
3. **Sept 3–4:** If multiple Auth service replicas are added for the demo, extend the `upstream`
   block — otherwise no further Nginx change is expected.

## Testing plan

- The existing `deploy-vps.yml` workflow's `verify` job already runs against every PR touching
  `nginx/**` or `docker-compose.yml` — no new CI job needed, just make sure the rename keeps
  triggering it (the path filters already include both).
- Manual check after any Nginx config change: `curl -I https://api-insightiq.zerotools.online/me`
  (or the local equivalent) returns from the Auth service, not a 502, before considering the change
  done.

## Open risks

- Nginx config, Docker Compose, and deployment changes described here are product/deployment work
  and belong on the `init`/`main` branches, per the
  [worktree and branch guide](../../WORKTREE-AND-BRANCH-GUIDE.md) — this document only records the
  plan; it does not itself change `docker-compose.yml` or `nginx/templates/*`.
- Whether the hackathon demo needs horizontal scaling (multiple Auth replicas) at all — likely not,
  given expected demo-day traffic; the `least_conn`/`upstream` shape above is there so it's a
  one-line change if needed, not because it's expected to be needed.
