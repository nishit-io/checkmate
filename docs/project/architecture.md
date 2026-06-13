# Architecture — Checkmate

Static, no-build task manager. Vanilla HTML/CSS/JS SPA + Supabase (auth, Postgres,
realtime). Deployed to Vercel as static files. Falls back to `localStorage` when
Supabase is not configured.

## Component map

```
index.html ── loads ──► config.js  (Supabase URL + anon key)
                        Supabase JS CDN
                        db.js       (window.DB — data/auth/realtime)
                        app.js      (all UI + state; calls window.DB only)
                        style.css   (tokens, matrix, Today's bar, mobile layer)
```

- **`config.js`** — `window.CHECKMATE_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY }`.
  Anon key public by design; RLS isolates users. No secrets.
- **`db.js`** — IIFE exposing `window.DB`. Sole Supabase boundary.
- **`app.js`** — UI-only. Owns `state`. Never imports Supabase directly.
- **`style.css`** — design tokens + desktop + `html.mobile-mode` layer.

## Data layer (`db.js`)

| Export | Purpose |
|--------|---------|
| `Auth` | `getSession`, `getUser`, `onChange`, `signInWithGoogle`, `signInWithPassword`, `signUp`, `signOut`, `updateUser(data)`, `resetPassword(email)` |
| `fetchAll` | Load categories + tasks for user |
| `upsertTask` / `upsertTasks` / `deleteTask` | Task writes |
| `insertCategory` / `updateCategory` / `deleteCategory` / `reorderCategories` | Category writes |
| `subscribe(cb)` / `unsubscribe` | Realtime on `tasks` + `categories` |
| `migrateLocalStorageIfNeeded` | One-time localStorage→cloud import |
| `importData(payload)` | Manual cross-origin import (console) |

### Shape mapping — single translation point

DB rows are **snake_case**, in-app objects are **camelCase**:

| DB row | App object |
|--------|-----------|
| `category_id` | `category` |
| `due_date` | `dueDate` |
| `sort_order` | `order` |

Done by `rowToTask` / `taskToRow` / `rowToCat`. Nothing else in the app touches DB
column names.

## State (`app.js`)

Single `state` object:

```js
state = { tasks, categories, profile, settings }
```

- **tasks / categories** → Supabase tables (or localStorage when unconfigured).
  Persisted by `saveData()` / `persist*` helpers.
- **profile / settings** → Supabase `user_metadata` via
  `DB.Auth.updateUser({data})` (+ localStorage mirror). `saveProfileSettings()`.
  **No table/schema migration needed.**

## Rendering

- **Desktop board**: matrix, rows = priority (High/Med/Low), cols = status —
  **4 columns: Backlog → To Do → In Progress → Completed**. Cells are static HTML
  (`.matrix-cell[data-status][data-priority]`); `renderTasks()` clears them and
  appends `createTaskCard(t)` into the matching cell, tallying `colCounts`/`rowCounts`.
  New tasks default to `backlog`.
- **Responsive board** (all `style.css`):
  - Cards inside a cell: `repeat(auto-fit, minmax(min(100%,260px),1fr))` — add a
    column only when each card stays ≥260px; 1 column on narrow (no clip).
  - **Fills viewport height** (≥1025px, `:not(.mobile-mode)`): `.board-view` flexes,
    3 `.matrix-row`s share height (`flex:1 1 0`), each `.matrix-cell` scrolls
    internally → page never scrolls. Below 1024px → page-scroll fallback.
  - **Fluid tokens**: row-label width / gap / cell padding use `clamp()`.
  - Board cards hide the redundant footer status label (`.matrix-cell .card-status-label`).
- **Collapsible sidebar**: top-bar ☰ toggles `#app.sidebar-collapsed` → grid first
  column `64px` (icon rail). `applySidebar`/`toggleSidebar`, persisted in
  `localStorage checkmate_sidebar_collapsed`. Mirrors the viewport-toggle pattern.
- **Per-task pick-rank**: `state.taskRanks = { id: { r:1..4, cell } }` (0 = unranked),
  scoped to a status×priority cell. `reconcileTaskRanks` runs every render to drop
  stale ranks (move → reset) and renumber survivors; `sortCellTasks` orders a cell
  ranked (1→4) → unranked by due date → drag order. Board/drill cards show an
  editable rank strip; list view a read-only badge.
- **Category colors**: `PRESET_COLORS` (24 swatches) is the single source for both
  the new-category form picker (`setupPresetColorsPicker`) and the edit popover
  (`openCategoryColorPicker`, a 6-column grid).
- **Mobile** (`html.mobile-mode`): status×priority count-grid (4 status cols) → tap
  cell drills into that intersection's list → title-first quick-add sheet; bottom nav.
- **Viewport toggle**: `html.force-mobile` renders the mobile layout in a centered
  column on desktop (test mobile without F12). `applyViewport`/`toggleViewport`.
- **Theme**: light default; `applyTheme` + top-bar toggle; persisted per-device.

## Auth & sync flow

1. `boot()` → `Auth.getSession()`. No session → login gate.
2. On sign-in → `loadCloudData()` → `fetchAll` + `loadProfileSettings(user_metadata)`.
3. `migrateLocalStorageIfNeeded` runs once per user **only if cloud has 0 tasks**
   (dup guard) — gated by `checkmate_migrated_<uid>` flag.
4. `subscribeRealtime()` → changes propagate ~1s, no refresh.
5. Unconfigured Supabase → `loadLocalData()` path, no login.

## Constraints

- No build tooling. Edit + reload.
- localhost = test-only; real data added only via the Vercel app (avoids migration
  re-runs that duplicate tasks in the shared cloud DB).
- RLS is the only user isolation — enabled by `supabase/schema.sql`.
