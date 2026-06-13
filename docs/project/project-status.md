# Project Status — Checkmate

_Last updated: 2026-06-13_

## Snapshot

- **App**: static HTML/CSS/JS task manager + Supabase cloud sync. No build step.
- **Branch**: `main`.
- **Deploy**: Vercel — <https://checkmate-eta-nine.vercel.app> (auto-deploys on push to `main`).
- **Supabase project ref**: `cjblwyiayfuughypujla`.

## Git state

- HEAD = `7f85241` (24 color presets) — **pushed to Vercel**. Working tree clean
  (no uncommitted source changes).
- Recent pushed: `7f85241` color presets · `61dbcee` sidebar toggle + per-task
  pick-rank (also bundled the responsive board overhaul) · `0563ca4` Backlog column.
- **Untracked** (not committed): `.planning/` (sketches), `docs/` (plans),
  `architecture.excalidraw`, and the doc files (`CLAUDE.md`, `architecture.md`,
  `changelog.md`, `project-status.md`, `memory.md`).
- Today's bar commit `15b504f` was reset (dropped); recoverable via reflog.

## Done

- Cloud sync: auth gate (Google + email/password), Postgres tables, realtime, RLS.
- One-time localStorage→cloud migration with dup guard.
- Desktop status×priority matrix board — **now 4 status columns**: Backlog → To Do →
  In Progress → Completed. New tasks default to Backlog.
- Mobile redesign: count-grid → drill-in list → title-first quick-add; bottom nav.
- In-app desktop/mobile viewport toggle (no F12).
- Light default theme; top-bar theme toggle.
- Profile menu + Profile/Settings modals (stored in `user_metadata`).
- Mobile stats bar + category chip counts.
- **Responsive board** (pushed): auto-fit card columns (≥260px), viewport-fill rows
  with per-cell scroll, fluid `clamp()` tokens, no redundant status label on board cards.
- **Collapsible sidebar** (pushed): top-bar ☰ → ~64px icon rail, persisted per device.
- **Per-task pick-rank** (pushed): pick order 1..4 within each status×priority cell,
  auto-bump on move/delete; cards sort ranked → due date → drag order.
- **24 category color presets** (pushed): vivid + bright/mid + two pastel rows;
  6-column popover grid. Drives both form picker and edit popover.

## Pending / next

- **Decide** fate of untracked `.planning/` + `docs/` + doc files (commit / gitignore / leave).
- Real **Delete account** (needs Supabase server-side RPC; currently disabled "Coming soon").
- _(Dropped)_ Today's bar / time-block planner — rejected as too high-effort.

## Known quirks / constraints

- **localhost is TEST-ONLY** — never sign into the real account locally (re-runs
  migration → duplicate tasks in shared cloud DB). Add real data via the Vercel app only.
- Headless preview viewport quirk: ~484px layout renders at a 402px window — screenshot
  mobile previews at the matching width.
- Supabase free tier pauses after ~7 days idle; first load after pause is slow.
- Board fill-height + per-cell scroll apply only ≥1025px logical width; below that it
  page-scrolls. 4K monitors are assumed OS-scaled (150–200%) → ~1080–2560 logical px.
- "≥2 card columns on every screen" is NOT guaranteed: 4 status columns can't fit 2
  readable cards each on narrow portrait; auto-fit gives 2+ only when width allows
  (helped by collapsing the sidebar).
