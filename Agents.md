# AGENTS.md — Checkmate

Instructions for AI coding agents working in this repo. Tool-agnostic companion to
[`CLAUDE.md`](CLAUDE.md); if they ever conflict, `CLAUDE.md` wins.

## What this is

**Checkmate** — a static, no-build task manager. Vanilla HTML/CSS/JS SPA backed by
Supabase (auth + Postgres + realtime). Falls back to `localStorage` when Supabase is
not configured. Deployed to Vercel as static files (no build step).

Live: <https://checkmate-eta-nine.vercel.app> · Supabase ref `cjblwyiayfuughypujla`.

## Project layout

| File | Role |
|------|------|
| `index.html` | Single page: login gate, top bar, collapsible sidebar, board (4-status × 3-priority matrix), mobile grid/drill/quick-add, modals, bottom nav. |
| `app.js` | All UI logic + state (`~2300` lines). Talks to the cloud only via `window.DB.*`. |
| `db.js` | Supabase layer (`window.DB`): auth, CRUD, realtime, row⇄object shape mapping, one-time migration. |
| `config.js` | Public Supabase URL + anon key (public by design; RLS protects data). Never put `service_role` here. |
| `style.css` | All styles: design tokens, desktop matrix, `html.mobile-mode` layer, modals. |
| `supabase/schema.sql` | Tables, RLS, new-user seeding, realtime. |
| `docs/superpowers/plans/` | Implementation plans per feature. |
| `.planning/sketches/` | Throwaway HTML mockups (not shipped). |

## Architecture rules (do not break)

- **No build, no framework.** Edit files directly, reload in browser.
- **`app.js` is UI-only.** Never call Supabase from `app.js` — go through `window.DB`.
- **Single shape-mapping point** in `db.js`: DB rows are snake_case (`category_id`,
  `due_date`, `sort_order`); in-app objects are camelCase (`category`, `dueDate`,
  `order`). Only `rowToTask`/`taskToRow`/`rowToCat` translate.
- **Single `state` object** in `app.js` (`tasks`, `categories`, `profile`, `settings`).
  `saveData()` persists tasks/cats; `saveProfileSettings()` persists profile/settings
  into Supabase `user_metadata` (no schema migration).
- **Status enum** (`tasks.status`): `backlog | todo | in-progress | done`. Keep in
  sync across `app.js`, `index.html`, and `schema.sql`. New tasks → `backlog`.
- **Don't hard-code card-column counts** — use auto-fit; counts rot when the status
  column count changes.

## Workflow conventions

- **Validate JS** after every edit: `node --check app.js`.
- **Verify UI headlessly** with throwaway `_previewN.html` files (auth gate blocks the
  real app); screenshot via headless Chrome; clean up preview/PNG temp files after.
- **localhost = TEST-ONLY.** Never sign into the real account locally — re-runs the
  migration and duplicates every task in the shared cloud DB. Add real data only via
  the Vercel app.
- **Git**: commit only when asked; push only when explicitly told ("Publish/Push to
  vercel"). Pushing `main` auto-deploys to Vercel. Commit trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Security

- Anon key in `config.js` is public by design; **RLS is the only user isolation**.
- Never commit `service_role` or any secret key.

## See also

- [`Context.md`](docs/project/Context.md) — what the project does and why.
- [`memory.md`](docs/project/memory.md) — durable decisions, incidents, hard rules.
- [`architecture.md`](docs/project/architecture.md) — component map, data layer, render flow.
- [`project-status.md`](docs/project/project-status.md) — current state and next steps.
- [`Skills.md`](docs/project/Skills.md) — tooling and skills relevant to this repo.
