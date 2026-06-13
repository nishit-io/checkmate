# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**Checkmate** — a static, no-build task manager. Vanilla HTML/CSS/JS SPA backed by
Supabase (auth + Postgres + realtime). Falls back to `localStorage` when Supabase
is not configured. Deployed to Vercel as static files (no build step).

## Files

| File | Role |
|------|------|
| `index.html` | Single page: login gate, top bar (incl. ☰ sidebar-collapse toggle), collapsible sidebar (nav/categories/account), board (desktop 4-status × 3-priority matrix: Backlog→To Do→In Progress→Completed), mobile grid/drill/quick-add, modals, bottom nav. |
| `app.js` | All UI logic + state. ~2200 lines. Talks to the cloud only via `window.DB.*`. |
| `db.js` | Supabase layer (`window.DB`): auth, fetch/upsert/delete, realtime, row⇄object shape mapping, one-time localStorage→cloud migration. |
| `config.js` | Public Supabase URL + anon key. Anon key is public by design (RLS protects data); never put `service_role` here. |
| `style.css` | All styles. Design tokens, desktop matrix, `html.mobile-mode` layer, modals. |
| `docs/SETUP.md` | Cloud setup runbook (Supabase → config → Vercel → Google OAuth). |
| `.planning/sketches/` | Throwaway gsd:sketch HTML mockups (not shipped). |
| `docs/superpowers/plans/` | Implementation plans per feature. |

## Architecture notes

- **No build / no framework.** Edit files directly; reload in browser.
- **`app.js` is UI-only.** Never call Supabase from `app.js` — go through `window.DB`.
- **Shape mapping in `db.js`**: DB rows are snake_case (`category_id`, `due_date`,
  `sort_order`); the in-app object is camelCase (`category`, `dueDate`, `order`).
  `rowToTask`/`taskToRow`/`rowToCat` are the only translation point.
- **State**: single `state` object in `app.js` (`tasks`, `categories`, `profile`,
  `settings`). `saveData()` persists tasks/cats; `saveProfileSettings()`
  persists profile/settings into Supabase `user_metadata` (+ localStorage mirror).
- **Profile/settings use `user_metadata`** via `DB.Auth.updateUser({data})` —
  no table/schema migration.
- **Realtime**: `DB.subscribe` listens to `tasks` + `categories` changes for the user.
- **Responsive**: CSS `@media (max-width:768px)` + JS-driven `html.mobile-mode` class.
  `html.force-mobile` powers the in-app desktop/mobile toggle (preview mobile on a laptop, no F12).
- **Fluid board** (desktop ≥1025px): board fills viewport height, the 3 priority rows
  share height, each cell scrolls internally; cards inside a cell use auto-fit
  `minmax(min(100%,260px),1fr)`; row-label/gap/padding use `clamp()`. Don't hard-code
  card-column counts — they rot when the status-column count changes.
- **Status enum** (`tasks.status`): `backlog | todo | in-progress | done` — keep in
  sync across `app.js` (`MOBILE_ST`, `ST_LABEL`, `colCounts`, defaults), `index.html`
  (board cells + task-form), and `schema.sql` (CHECK + default). New tasks → `backlog`.
- **Collapsible sidebar**: `#app.sidebar-collapsed` → 64px icon rail; persisted in
  `localStorage checkmate_sidebar_collapsed` (`applySidebar`/`toggleSidebar`).

## Data workflow — IMPORTANT

- **localhost / local ports are TEST-ONLY.** Do NOT sign into the real account on
  localhost — doing so re-runs migration and **duplicates tasks** in the shared cloud DB.
- **Add real data ONLY via the Vercel app.** (See memory: checkmate-data-workflow.)
- Migration is guarded: only runs when the cloud has 0 tasks and a per-user
  `checkmate_migrated_<uid>` flag is unset.

## Verification

Auth gate blocks the real app headlessly, so verify UI with throwaway preview files:

```powershell
python -m http.server 8181
# create a _previewN.html mirroring the real markup/CSS, then:
chrome.exe --headless=new --screenshot --window-size=1366,900 http://localhost:8181/_previewN.html
```

- Known headless quirk: a ~484px layout viewport renders at a 402px window — screenshot
  mobile previews at the matching width.
- Always run `node --check app.js` after editing JS.
- Clean up `_preview*.html` + screenshot PNGs when done.

## Git / deploy

- **Commit only when the user asks. Push only when explicitly told** ("Publish/Push to vercel").
- Pushing `main` to GitHub auto-deploys to Vercel.
- Commit messages end with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

## Design-task process (when the user asks for design/redesign work)

Apply, in order: superpowers/brainstorming (ask clarifying questions ONE at a time,
wait for each answer, identify gaps before coding) → ui-ux-pro-max → gsd:sketch
(`.planning/sketches/`, 2–3 variants, pick a winner) → superpowers/writing-plans
(`docs/superpowers/plans/`) → implement → verify. Always state which option you
recommend and why. Don't dump all steps at once; confirm after each logical step
unless the user says "all at once".
