# Repository Guidelines

## Project Structure & Module Organization

This repo is a small monorepo for Undercover, a Next.js + FastAPI + Supabase MVP.

- `apps/web/` contains the Next.js 14 app, app-router pages in `app/`, reusable UI in `components/`, and Supabase browser/server helpers in `utils/supabase/`.
- `apps/api/` contains the FastAPI service. The entrypoint is `app/main.py`; feature packages live under `app/api`, `app/services`, `app/repositories`, `app/models`, `app/detectors`, `app/clustering`, and `app/judge`.
- `apps/api/tests/` is reserved for backend tests.
- `supabase/migrations/001_init.sql` is the canonical database schema.
- `doc/` holds product, architecture, deployment, RLS, and API reference docs. Check these before changing behavior.
- `design-prompts/`, `design-templates/`, `team/`, and `data/demo/` hold planning, design, and demo assets.

## Build, Test, and Development Commands

- `npm run install:all` installs web workspace packages and Python API requirements.
- `npm run dev:web` starts the Next.js dev server.
- `npm run build:web` builds the web app.
- `npm run dev:api` starts FastAPI with reload from `apps/api`.
- `npm run lint --workspace apps/web` runs Next linting.
- `npm run typecheck --workspace apps/web` runs TypeScript checks.
- `docker compose up --build` runs the web and API containers together.

Copy `apps/web/.env.example` and `apps/api/.env.example` before running services that need Supabase or provider keys.

## Coding Style & Naming Conventions

Use TypeScript for the web app and Python for the API. Follow existing local style: React components in PascalCase, utility modules in camelCase or descriptive lowercase paths, and Python modules in snake_case. Keep Tailwind classes close to the markup unless a repeated component justifies extraction. Prefer small functions and existing package boundaries over new abstractions.

## Testing Guidelines

Add tests beside backend code under `apps/api/tests/` using `test_*.py` names. For frontend changes, at minimum run lint and typecheck. Add focused tests for new branching logic, parsers, detectors, or database-facing behavior.

## Commit & Pull Request Guidelines

History uses short imperative commits, sometimes with Conventional Commit prefixes such as `feat:`. Keep commits scoped, for example `feat: add trace intake model` or `Add deployment documentation`.

Pull requests should include a concise summary, linked issue or context, test commands run, and screenshots for visible UI changes. Call out schema, environment, or deployment changes explicitly.

## Security & Configuration Tips

Never expose Supabase `service-role` keys or provider secrets to the browser. Keep API secrets in `apps/api/.env`; use `apps/api/.env.example` as the template. Review `doc/05_RLS_AND_PERMISSIONS.md` before changing auth, RLS, or workspace behavior.
