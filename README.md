# 1 Click Business

Business launch platform with 13 AI tools, hosted business sites, lead CRM, Autumn/Stripe subscriptions, an admin console, and inline onboarding. Built on the managed Runable Bun/React/Hono stack.

## Setup

1. Install Bun, then run `bun install`.
2. Copy `.env.template` to the root `.env` and configure database, AI gateway, managed authentication and billing credentials. Never commit `.env`.
3. Run `bun run db:push` only against the intended database, then `bun run dev`.
4. See `LAUNCH.md` for production billing, publishing and deferred email setup. Email remains disabled until a verified sender and Resend key are configured.

Source and static assets are included; hosted database records, customer data, secrets and external storage objects are not. This `runable-launch` branch contains the current Runable version; the original app remains on `main`.

The root package commands are the external contract:

- `bun run dev` starts the web app.
- `bun run dev:desktop` and `bun run dev:mobile` start platform clients.
- `bun run build` builds every package.
- `bun run start` starts or restarts the production server.
- `bun run stop` stops the production server.
- `bun run lint` and `bun run typecheck` validate the project.
- The `db:generate`, `db:migrate`, and `db:push` commands manage the database.

Deployment tools depend on these command names. Their implementations may change, but the names must remain stable.

The web package owns the API, database, and shared web interface. The mobile package is an Expo client. The desktop package is an Electron shell around the web app. Services use the fixed ports defined in `__ports.cjs`, and the web health endpoint is `/api/health`.

Secrets belong in the root `.env` file. Browser values must use the `VITE_` prefix. Commands prefixed with `internal:` are for template maintenance.
