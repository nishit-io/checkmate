# Memory — Checkmate

Durable project facts and decisions worth keeping in-repo. (Distinct from Claude's
private auto-memory; this lives with the code.)

## Hard rules

- **localhost / local ports = TEST-ONLY.** Do NOT sign into the real account on
  localhost — it re-runs the migration and **duplicates every task** in the shared
  cloud DB. Add real data ONLY via the Vercel app.
- **Anon key in `config.js` is public by design.** RLS is the only user isolation.
  Never commit `service_role` or any secret key.
- **Commit only when asked. Push only when explicitly told** ("Publish/Push to vercel").
  Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Key decisions

- **No build step / no framework** — vanilla HTML/CSS/JS, edit-and-reload. Keep it that way.
- **`app.js` is UI-only**; all Supabase access goes through `window.DB` (`db.js`).
- **Profile / settings live in `user_metadata`** (via `DB.Auth.updateUser`),
  not new tables — avoids schema migration.
- **Today's bar / time-block planner: rejected** (2026-06-08) — too much manual
  effort dragging each task into slots. Don't re-propose without a low-effort auto-fill.
- **Default theme = light.**
- **Migration is dup-guarded**: runs once per user, only when cloud has 0 tasks.
- **Status workflow = Backlog → To Do → In Progress → Completed** (2026-06-08).
  New tasks default to **Backlog**. DB `status` CHECK + default updated in `schema.sql`.
- **Board cards-per-cell = readable auto-fit, never forced** (2026-06-08).
  `minmax(min(100%,260px),1fr)`. User explicitly rejected forcing ≥2 columns on narrow
  screens (would make cards tiny). 2+ columns appear only when width allows.
- **Board fills viewport height; cells scroll internally** (rows share height equally).
  Desktop only (≥1025px logical). 4K assumed OS-scaled → ~1080–2560 logical px.
- **Sidebar collapses to a ~64px icon rail** (top-bar ☰, persisted
  `checkmate_sidebar_collapsed`). Reclaims width; mobile unaffected.
- **Per-task pick-rank** (2026-06-08) — pick order 1..4 scoped to each
  status×priority cell (`state.taskRanks = { id: { r, cell } }`); 0 = unranked.
  Auto-bump: `reconcileTaskRanks` runs every render, drops ranks for moved/deleted
  tasks and renumbers survivors 1..k. Cell sort = ranked → due date → drag order.
- **24 category color presets** (2026-06-13) — `PRESET_COLORS` (single source for
  both the new-category form picker and the edit popover): vivid + bright/mid +
  two rows of soft pastels. Popover is a 6-column CSS grid (`repeat(6,26px)`),
  not flex-wrap. Don't hard-code per-row counts elsewhere.

## Incidents / fixes (don't repeat)

- **Task duplication (critical)**: per-origin migration flag meant logging into the
  real account from localhost re-migrated localStorage tasks with new UUIDs → exact
  2× duplicates in cloud. Fixed with the 0-tasks guard + dedup SQL. Root cause =
  using localhost against the real account.
- **Mobile column clipping**: forgot to hide desktop `.stats-grid` in `mobile-mode`;
  its no-wrap width forced the column wide. Always hide desktop-only fixed-width
  elements in the mobile layer.
- **4K horizontal scrollbar**: `overflow-y:auto` forces `overflow-x:auto`; fixed with
  `overflow-x:hidden` + `min-width:0` on card containers.
- **Stale card-grid breakpoint**: a fixed `≥1920px → 3-col` cell grid (tuned for the
  old 3-status board) made cards ~150px once a 4th status column was added → footer
  collision. Lesson: don't hard-code card-column counts; use auto-fit. Card-count
  breakpoints rot when the board's column count changes.
- **auto-fit clip trap**: `minmax(260px,1fr)` forces a 260px track even when the
  column is narrower → card overflows + clips. Fix: `minmax(min(100%,260px),1fr)`.

## Verification workflow

Auth gate blocks the real app headlessly → verify UI with throwaway `_previewN.html`
files mirroring real markup/CSS, screenshot via headless Chrome. Always
`node --check app.js` after JS edits. Clean up preview/PNG temp files after.

## Environment

- Vercel: <https://checkmate-eta-nine.vercel.app>
- Supabase ref: `cjblwyiayfuughypujla`
- Local test server: `python -m http.server 8181`
