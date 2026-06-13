# Profile & Settings — Implementation Plan

**Goal:** Move the theme switch to the top bar, add a profile-icon menu (Profile / Settings / Sign out) on desktop and via the mobile avatar popover, and build Profile + Settings modals (flat layout, sketch 002 winner B). Persist to Supabase auth `user_metadata` (localStorage in local mode). No SQL migration. Delete-account deferred (disabled row).

**Architecture:** New `state.profile` and `state.settings` objects with defaults, loaded from `session.user.user_metadata` (cloud) or localStorage (local), saved via a new `DB.Auth.updateUser({data})`. Two new modals reuse the existing `.modal-overlay/.modal-window` pattern (bottom-sheet on mobile already handled). Settings values are wired into existing render/filter code.

**Files:** Modify `db.js` (Auth.updateUser), `index.html` (top-bar profile menu + 2 modals, remove sidebar theme panel), `app.js` (state, load/save, modal logic, wiring), `style.css` (profile menu, flat settings rows, desktop theme btn).

---

### Task 1: Storage layer + state

- [ ] **1.1** `db.js` — add to `Auth`: `updateUser(data){ return client.auth.updateUser({ data }); }` and expose. (data merges into user_metadata.)
- [ ] **1.2** `app.js` — extend `state` with:
```js
profile: { displayName: '', avatarColor: '#6366f1', timezone: '' },
settings: { defaultView: 'board', defaultPriority: 'medium', weekStart: 'sun',
            dateFormat: 'mmdd', density: 'comfortable', confirmDelete: true, showCompleted: true },
```
- [ ] **1.3** `app.js` — `loadProfileSettings(meta)` merges `meta` (cloud user_metadata) or localStorage into state.profile/state.settings; apply: `state.theme` already handled; set `state.activeView` from `settings.defaultView` if no saved view; `applyDensity()`. Call from `loadCloudData` (pass `session.user.user_metadata`) and `loadLocalData` (from `localStorage.checkmate_profile/settings`).
- [ ] **1.4** `app.js` — `saveProfileSettings()`: cloud → `DB.Auth.updateUser({ display_name, avatar_color, timezone, settings })`; always mirror to localStorage. Toast/inline "Saved".
- [ ] **1.5** `applyDensity()` toggles `document.documentElement.classList.toggle('density-compact', state.settings.density==='compact')`.

### Task 2: Top bar — move theme, add profile menu

- [ ] **2.1** `index.html` — remove the sidebar `.theme-selector` block. Show the one-tap `#theme-toggle-btn` on desktop too (next to `#viewport-toggle-btn`). Add profile menu at end of top bar:
```html
<div class="profile-menu-wrap">
  <button class="profile-menu-btn" id="profile-menu-btn" aria-label="Account" aria-haspopup="true">N</button>
  <div class="profile-menu" id="profile-menu" hidden>
    <div class="pm-who"><b id="pm-name">User</b><span id="pm-email"></span></div>
    <button id="pm-profile"><i class="ri-user-line"></i> Profile</button>
    <button id="pm-settings"><i class="ri-settings-3-line"></i> Settings</button>
    <div class="pm-sep"></div>
    <button id="pm-signout" class="pm-danger"><i class="ri-logout-box-r-line"></i> Sign out</button>
  </div>
</div>
```
- [ ] **2.2** `style.css` — `.theme-toggle-btn` shown on desktop (currently mobile-only): add a base desktop style (icon button next to viewport toggle). `.profile-menu*` styles (dropdown, rows, danger). `.profile-menu[hidden]{display:none}`.
- [ ] **2.3** `app.js` — DOM refs; bind: avatar/profile-menu-btn toggles `#profile-menu` (reuse the popover open/close pattern, close on outside click); `pm-profile`→openProfileModal; `pm-settings`→openSettingsModal; `pm-signout`→DB.Auth.signOut. Desktop `#theme-toggle-btn`→toggleTheme. Mobile avatar popover: extend its menu to include Profile/Settings/Sign out (same handlers).
- [ ] **2.4** `app.js` — set avatar text + color from state.profile in `applyProfile()` (top-bar avatar, popover avatar). Update on session + after save.

### Task 3: Profile modal

- [ ] **3.1** `index.html` — add `#profile-modal` (modal-overlay/window): avatar preview + 5 color dots, display-name input, email (disabled), timezone select (a short curated list + the user's current), footer Cancel/Save.
- [ ] **3.2** `app.js` — `openProfileModal()` fills fields from state.profile + session email; color dots set `tempAvatarColor`; `saveProfile()` writes state.profile, calls `saveProfileSettings()`, `applyProfile()`, closeModal, inline "Saved".
- [ ] **3.3** Timezone select options: build from a small constant list `TIMEZONES` (≈12 common offsets) ensuring the stored value is present.

### Task 4: Settings modal (flat) + wiring

- [ ] **4.1** `index.html` — add `#settings-modal` with 4 flat sections (Preferences / Display / Behavior / Account & data) per sketch B: segmented controls, mini-selects, toggles, link buttons; delete-account row disabled ("Coming soon").
- [ ] **4.2** `style.css` — flat settings styles: `.set-section h3` (colored header + underline), `.set-row` (label + control, divider), `.seg`/`.seg button.on`, `.toggle`/`.toggle.on`, `.link-btn`, `.danger-txt`. Mobile: rows stack control under label if cramped.
- [ ] **4.3** `app.js` — `openSettingsModal()` reflects current state.settings + state.theme into controls; control handlers update state + call `saveProfileSettings()` + apply live:
  - theme seg → state.theme + applyTheme
  - defaultView seg → settings.defaultView
  - defaultPriority select → settings.defaultPriority
  - weekStart/dateFormat seg → settings.* + renderTasks (date labels)
  - density seg → settings.density + applyDensity
  - confirmDelete toggle → settings.confirmDelete
  - showCompleted toggle → settings.showCompleted + renderTasks
  - change password link → `DB.Auth` reset email (supabase `resetPasswordForEmail(email)`); inline "Reset link sent"
  - export → download JSON of {tasks, categories}; import → file input → `DB.importData` (cloud) / merge (local)
  - sign out → DB.Auth.signOut
- [ ] **4.4** Wire settings into behavior:
  - `getFilteredTasks()` — if `!settings.showCompleted`, exclude `status==='done'`.
  - task delete path — gate `confirm()` on `settings.confirmDelete`.
  - new-task defaults (quick-add `openQuickAdd`, full modal `openTaskModal`) — default priority = `settings.defaultPriority`.
  - `createTaskCard` due-date label — format per `settings.dateFormat`.
  - boot — initial `setView(state.settings.defaultView)` when no per-session view chosen.
- [ ] **4.5** `db.js` — add `Auth.resetPassword(email){ return client.auth.resetPasswordForEmail(email); }`; export. Add `DB.exportData()` returning `fetchAll()` shape (reuse) for cloud; local export reads state.

### Task 5: Verify + commit

- [ ] **5.1** `node --check app.js`.
- [ ] **5.2** Headless screenshots: desktop top bar (theme + profile menu), Profile modal, Settings modal (light/dark); mobile avatar popover → Profile/Settings as bottom sheets. No overflow.
- [ ] **5.3** Confirm density/showCompleted/confirmDelete/default-priority actually change behavior.
- [ ] **5.4** Commit: `feat: profile menu, Profile + Settings modals, theme moved to top bar`.

---

## Self-Review
- **Coverage:** theme→top bar (T2), profile icon→menu Profile/Settings (T2), Profile fields (T3), Settings groups all four (T4), both available on mobile (T2.3 popover + bottom-sheet modals). ✓
- **Storage:** user_metadata via DB.Auth.updateUser, localStorage mirror, no migration. ✓
- **Deferred:** delete-account row disabled (no client self-delete). ✓
- **Reuse:** modal pattern, DB.importData, getFilteredTasks, createTaskCard, existing theme state. ✓
- **Risk:** weekStart has low functional surface (no calendar widget) — store + apply to any week calc; otherwise cosmetic. dateFormat applies in createTaskCard only.
