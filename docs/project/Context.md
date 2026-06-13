# Context — Checkmate

_Last updated: 2026-06-13_

## What it is

Checkmate is a **static, no-build task manager** — a kanban-style SPA written in
vanilla HTML/CSS/JS. It syncs to the cloud via Supabase (auth + Postgres + realtime)
and falls back to `localStorage` when Supabase is not configured. Hosted on Vercel;
pushing `main` auto-deploys.

- Live: <https://checkmate-eta-nine.vercel.app>
- Supabase project ref: `cjblwyiayfuughypujla`
- Repo: <https://github.com/nishit-io/checkmate>

## Why it's built this way

- **No build / no framework** — deliberate. Edit-and-reload, deploy as static files,
  zero toolchain. Keep it that way.
- **Supabase, not a custom backend** — auth, Postgres, realtime, and RLS out of the
  box. The anon key is public by design; Row Level Security is the only user isolation.
- **localStorage fallback** — the app is usable before any cloud setup, and offline.

## Core model

- **Board = matrix.** Rows = priority (High / Medium / Low); columns = status.
  **4 statuses**: Backlog → To Do → In Progress → Completed. New tasks default to Backlog.
- **Tasks**: title, due date, priority, status, subtasks, category, and a per-task
  **pick-rank** (1..4) scoped to its status×priority cell (auto-renumbers on move/delete).
- **Categories**: named + colored (24 preset colors: vivid + soft pastels).
- **Profile / settings**: stored in Supabase `user_metadata` (no extra tables).

## Surfaces

- **Desktop**: status×priority matrix that fills the viewport height; each cell scrolls
  internally; auto-fit card columns (≥260px). Collapsible sidebar (☰ → 64px icon rail).
- **Mobile** (`html.mobile-mode`): count-grid → drill-in list → title-first quick-add;
  bottom nav. In-app desktop/mobile viewport toggle (preview mobile without F12).
- **Theme**: light default; top-bar toggle; persisted per device.

## Sync flow

1. `boot()` checks the Supabase session; no session → login gate.
2. On sign-in → load categories + tasks + profile (`user_metadata`).
3. One-time `localStorage`→cloud migration, **dup-guarded** (runs once per user, only
   when the cloud has 0 tasks; `checkmate_migrated_<uid>` flag).
4. Realtime subscription → changes propagate ~1s, no refresh.
5. Unconfigured Supabase → local-only path, no login.

## Current state

- HEAD `7f85241`, pushed to Vercel. Recent: 24 color presets, collapsible sidebar,
  per-task pick-rank, responsive board overhaul, Backlog status column.
- Open: decide fate of untracked docs/planning files; real "Delete account"
  (needs a Supabase server-side RPC; currently disabled).
- **Dropped**: Today's bar / time-block planner (too much manual effort — don't
  re-propose without low-effort auto-fill).

## Hard constraints

- **localhost = TEST-ONLY** — never sign into the real account locally (re-runs
  migration → duplicate tasks). Real data only via the Vercel app.
- Supabase free tier pauses after ~7 days idle; first load after a pause is slow.
- Viewport-fill board + per-cell scroll apply only ≥1025px logical width.

See [`Agents.md`](../../Agents.md) for working rules, [`memory.md`](memory.md) for the full
decision log, [`architecture.md`](architecture.md) for internals.
