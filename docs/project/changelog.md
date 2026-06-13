# Changelog — Checkmate

All notable changes. Newest first. Dates from git history.

## 2026-06-13 (pushed)

- `7f85241` feat: expand category color presets 8 → 24, add soft pastel options.
  `PRESET_COLORS` gains a bright/mid row + two rows of eye-soothing pastels (drives
  both the new-category form picker and the edit popover); color popover laid out as
  a 6-column grid instead of flex-wrap + fixed width. **Pushed to Vercel.**

## 2026-06-08 (pushed, later)

- `61dbcee` feat: collapsible sidebar toggle + per-task pick-rank within cells.
  Bundled the responsive board overhaul + sidebar (previously local) and added
  per-task pick-rank:
  - **Per-task pick-rank** — pick order (1..4) scoped to each status×priority cell;
    auto-bump renumbers survivors on move/delete; cards sort ranked → due date →
    drag order. `state.taskRanks`, `reconcileTaskRanks`/`setTaskRank`/`sortCellTasks`.
  - **Collapsible sidebar** — top-bar ☰ collapses sidebar to a ~64px icon rail,
    reclaiming ~220–300px for the board. Persisted (`checkmate_sidebar_collapsed`);
    `applySidebar`/`toggleSidebar` mirror the viewport-toggle pattern. Mobile unaffected.
  - **Card layout fix** — replaced stale `≥1920px → 3-col` grid (tuned for the old
    3-status board, made cards ~150px under 4 columns) with auto-fit
    `repeat(auto-fit, minmax(min(100%,260px),1fr))`: adds a column only when each card
    stays ≥260px, 1 column on narrow (no clip).
  - **Removed redundant board-card status label** — cards sit in their status column;
    footer status text was redundant + the collision source. List-view keeps B/T/P/D toggles.
  - **Viewport-fill board** — board fills content height, 3 priority rows share height,
    each cell scrolls internally so the page never scrolls. Desktop only (≥1025px,
    `:not(.mobile-mode)`); below 1024px → page-scroll fallback.
  - **Fluid tokens** — row-label width / gap / cell padding use `clamp()`.
  - Verified headless at 1080×1920, 1440×2560, 2560×1440, 1920×1080 (light + dark) +
    expanded/collapsed sidebar.

## 2026-06-08 (pushed)

- `0563ca4` feat: add Backlog status column (Backlog → To Do → In Progress → Completed).
  4th board column (desktop + mobile grid); new tasks default to Backlog; DB CHECK
  constraint + column default updated in `schema.sql`; existing To Do tasks moved to
  Backlog via one-time Supabase SQL. **Pushed to Vercel.**
- **Reverted Today's bar** (was `15b504f`) — concept dropped (too much manual effort);
  commit reset, old sidebar restored.
- Project docs added: `CLAUDE.md`, `architecture.md`, `changelog.md`,
  `project-status.md`, `memory.md` (untracked).

## 2026-06-07

- `7fd1c2c` feat: show task count on mobile category chips.
- `ee11efb` feat: compact stats bar on mobile between search and category chips.
- `a35477d` fix: remove stray horizontal scrollbar in board matrix cells
  (`overflow-x:hidden` + `min-width:0` on card containers; 4K).
- `21da63d` feat: profile menu + Profile & Settings modals; theme moved to top bar.
- `0440dc8` fix: scroll content area on mobile so long lists/boards get a scrollbar.
- `3860842` fix: mobile top-bar overflow — hide stats, wrap category chips.
- `1d3c119` feat: mobile matrix-grid view with drill-in, quick-add, desktop/mobile toggle.

## 2026-06-06

- `7398c7e` feat: responsive mobile view with in-app desktop/mobile toggle.

## 2026-06-05

- `55bcaa3` docs: update SETUP.md with live Vercel URL + project ref.
- `4fc0c3c` feat: `DB.importData` for cross-origin manual data import.
- `8e24ae7` chore: add Supabase project URL + anon key to config.
- `f730759` feat: Supabase cloud sync — auth gate, DB layer, realtime, migration.
- `605813e` Initial commit: Checkmate static task manager (localStorage).
