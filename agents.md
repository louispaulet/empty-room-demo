# Agent Instructions

Always read `agents.md` before starting any task. If it cannot be found at the repository root, assume it does not exist and suggest creating one.

## Project Map

- `src/main.tsx` mounts the React app inside `HashRouter` for GitHub Pages compatibility.
- `src/App.tsx` owns top-level route definitions only.
- `src/components/layout` contains shared page chrome such as the navbar, footer, and app shell.
- `src/pages` contains routed pages like the studio, about page, and not-found page.
- `src/features/empty-room` contains the room image workflow: upload UI, generation settings, queue rendering, API client, constants, types, and queue helpers.
- `src/lib` contains reusable frontend utilities that are not feature-specific.
- `worker/index.ts` contains the Cloudflare Worker API for `POST /api/empty-room`.
- `worker/index.test.ts` covers Worker behavior and request validation.
- `scripts/sync-dev-vars.mjs` writes `.dev.vars` from `.env.local` for local Wrangler dev.
- `scripts/put-worker-secret.mjs` uploads `OPENAI_API_KEY` to Cloudflare Worker secrets.
- `Makefile` is the main command surface for local dev, testing, checks, builds, and deploys.

## Command Guide

- `make up` starts both the frontend and backend locally.
- `make up-frontend` starts only Vite and points it at `LOCAL_WORKER_URL`.
- `make up-backend` starts only Wrangler and syncs `.env.local` into `.dev.vars`.
- `make kill`, `make kill-frontend`, and `make kill-backend` stop local dev processes.
- `make test` runs all unit tests.
- `make test-frontend` runs tests under `src`.
- `make test-backend` runs tests under `worker`.
- `make check` runs the full non-regression suite and should be used before finishing.
- `make check-frontend` runs frontend tests and a production frontend build.
- `make check-backend` runs backend tests, backend typecheck, and Worker dry-run deploy.
- `make build`, `make build-frontend`, and `make build-backend` build/check the relevant side.
- `make worker-secret` uploads the OpenAI key from `.env.local`; `make worker_secret` is an alias.
- `make deploy-backend` deploys the Worker.
- `make deploy-frontend WORKER_URL=https://...` deploys the GitHub Pages frontend.
- `make deploy WORKER_URL=https://...` deploys both backend and frontend.

## Development Rules

- Preserve existing user changes. Check `git status` and inspect relevant diffs before editing files that are already modified.
- Use targeted Make commands while iterating, then run `make check` before declaring the task complete.
- Add or update unit tests whenever adding new behavior.
- Keep the browser app free of secrets. OpenAI keys belong only in `.env.local`, `.dev.vars`, and Cloudflare Worker secrets.
- Keep Worker API behavior stable unless the task explicitly asks for backend API changes.
- Use lowercase `agents.md` for this repository.

## Completion Rules

- Always commit and push when done, even if working on `main`.
- Before committing, review `git status` and stage only intentional changes.
- Prefer a clear commit message that names the user-visible change.
- If validation cannot be completed, explain exactly what was skipped and why before committing.
