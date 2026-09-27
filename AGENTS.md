# Repository Guidelines

## Project Structure & Module Organization

This repository is a small monorepo for Undercover, a Hidden Failures Intelligence MVP.

- `apps/web/` contains the Next.js 14 frontend. Routes live in `app/`, reusable UI in `components/`, and Supabase helpers in `utils/supabase/`.
- `apps/api/` contains the FastAPI backend. The entrypoint is `app/main.py`; future domain code is organized under `api/`, `core/`, `models/`, `repositories/`, `services/`, `detectors/`, `clustering/`, and `judge/`.
- `supabase/migrations/` contains the canonical database schema.
- `doc/` holds architecture, deployment, product, API, and workflow notes.
- `design-prompts/`, `design-templates/`, `team/`, and `data/demo/` hold planning, design, and demo assets.

## Build, Test, and Development Commands

- `npm run install:all` installs root/web npm packages and Python API requirements.
- `npm run dev:web` starts the Next.js dev server from `apps/web`.
- `npm run build:web` builds the frontend.
- `npm run dev:api` starts FastAPI with reload using `apps/api/app/main.py`.
- `npm run lint --workspace apps/web` runs the frontend linter.
- `npm run typecheck --workspace apps/web` runs TypeScript checks.
- `docker compose up --build` runs the web and API services together.

Copy `apps/web/.env.example` and `apps/api/.env.example` before running services that need Supabase or provider keys.

## Coding Style & Naming Conventions

Use TypeScript/React conventions in `apps/web`: PascalCase components, camelCase functions and variables, and route folders under `app/`. Keep styling in Tailwind/global CSS unless a component needs local logic. Use Python 3 style in `apps/api`: snake_case functions and modules, explicit imports, and simple FastAPI route functions. Prefer existing folders and helpers before adding new structure.

## Testing Guidelines

There is no full test suite yet. Add the smallest useful test with new non-trivial backend logic under `apps/api/tests/`, using `test_*.py` names. For frontend changes, at minimum run `npm run lint --workspace apps/web` and `npm run typecheck --workspace apps/web`; add focused tests when a test harness exists.

## Commit & Pull Request Guidelines

Recent history uses short imperative messages, sometimes with Conventional Commit prefixes, such as `feat: initialize project with package.json and Supabase schema` or `Add deployment documentation and Render configuration for backend service`. Keep commits focused and describe the user-visible change. PRs should include a short summary, validation commands run, linked issues when relevant, screenshots for UI changes, and notes for any schema or environment changes.

## Security & Configuration Tips

Never expose Supabase service-role keys, provider keys, or backend-only secrets to the browser. Keep frontend variables limited to `NEXT_PUBLIC_*` values, and put server secrets in `apps/api/.env` or deployment secret storage.
