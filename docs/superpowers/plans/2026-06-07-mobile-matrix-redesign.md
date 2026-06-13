# Mobile Matrix Redesign — Implementation Plan

**Goal:** Rework the mobile view into a 3×3 status×priority count-grid that drills into a full-screen task list, add an in-app desktop/mobile toggle (centered ~400px column), and a title-first quick-add — matching sketch 001 winner (Variant B).

**Architecture:** Pure responsive CSS (`@media max-width:768px`) PLUS a JS-driven `force-mobile` class so the toggle can preview the mobile layout on a laptop in a centered ~400px column. Board renders the existing matrix cells; on mobile a new grid of count-tiles overlays them, and a drill-in panel shows one cell's tasks by reusing the existing `createTaskCard`. No backend changes.

**Tech Stack:** Vanilla HTML/CSS/JS, Supabase (untouched). No build, no tests framework → verification via headless-Chrome screenshots at the 400px column and at 390px.

**Files:**
- Modify: `index.html` — top-bar toggle button; replace board status-tabs+priority-chips with grid + drill-in panel; quick-add sheet.
- Modify: `style.css` — mobile layer: force-mobile column, grid tiles (Variant B), drill-in, quick-add sheet; remove old status-tabs/priority-chips rules.
- Modify: `app.js` — `forceMobile` toggle + persistence; grid count render; drill-in open/close (render cell tasks); title-first quick-add + contextual prefill.

**Current baseline:** disk has the previous flat redesign (status-tabs + priority-chips, bottom nav Board/Add/List, top-bar theme+avatar, category chips). This plan replaces the board mechanic and re-adds the toggle.

---

### Task 1: Re-add desktop/mobile toggle (centered 400px column)

**Files:** Modify `index.html` (top bar), `style.css` (mobile layer), `app.js`.

- [ ] **1.1** `index.html` — add toggle button in top bar, before the theme button:
```html
<button type="button" class="viewport-toggle-btn" id="viewport-toggle-btn" aria-label="Toggle mobile preview" aria-pressed="false"><i class="ri-smartphone-line"></i></button>
```
- [ ] **1.2** `app.js` — add state + functions (near theme toggle):
```js
let forceMobile = localStorage.getItem('checkmate_force_mobile') === '1';
function applyViewport() {
  const root = document.documentElement;
  const realMobile = window.matchMedia('(max-width:768px)').matches;
  root.classList.toggle('force-mobile', forceMobile && !realMobile);
  const btn = DOM.viewportToggleBtn;
  if (btn) {
    btn.setAttribute('aria-pressed', String(forceMobile));
    const i = btn.querySelector('i');
    if (i) i.className = forceMobile ? 'ri-computer-line' : 'ri-smartphone-line';
  }
}
function toggleViewport() {
  forceMobile = !forceMobile;
  localStorage.setItem('checkmate_force_mobile', forceMobile ? '1' : '0');
  applyViewport();
}
```
- [ ] **1.3** `app.js` — add `viewportToggleBtn: document.getElementById('viewport-toggle-btn')` to DOM; call `applyViewport()` in `boot()`; bind `DOM.viewportToggleBtn.addEventListener('click', toggleViewport)` in setupEventListeners.
- [ ] **1.4** `style.css` — force-mobile column (no bezel). The `transform` on body makes fixed children (bottom nav, sheet, drill) stay inside the column:
```css
html.force-mobile { background:#0b0e14; }
html.force-mobile body { width:402px; height:min(860px, calc(100vh - 40px)); margin:20px auto; overflow:hidden; border:1px solid rgba(255,255,255,.08); border-radius:22px; box-shadow:0 24px 60px rgba(0,0,0,.5); transform:translateZ(0); position:relative; }
```
- [ ] **1.5** Make all `@media (max-width:768px)` mobile rules ALSO apply under `html.force-mobile`. Implementation: duplicate the media-query selector list with an `html.force-mobile` prefixed copy, OR (chosen) add `html.force-mobile` as an alternate trigger by wrapping shared rules. Use the existing approach: keep `@media` block, and add `html.force-mobile <selector>` equivalents via a shared list at top of the mobile section.

**Verify:** screenshot `?` toggle on → 402px centered column with border; toggle off → normal desktop.

---

### Task 2: Replace board mobile mechanic with the 3×3 count-grid

**Files:** Modify `index.html` (board), `style.css`, `app.js`.

- [ ] **2.1** `index.html` — inside `#workspace-board`, replace the existing `#board-mobile-tabs` and `#board-priority-chips` blocks with a grid container (desktop matrix rows below stay for desktop):
```html
<div class="mobile-grid" id="mobile-grid" aria-label="Status and priority overview">
  <div class="mg-corner">Pri / Status</div>
  <div class="mg-colhead">To Do</div><div class="mg-colhead">In Prog</div><div class="mg-colhead">Done</div>
  <!-- 3 rows × (label + 3 tiles) injected by renderMobileGrid() -->
</div>
```
- [ ] **2.2** `app.js` — add `renderMobileGrid()` that builds 3 rows (high/medium/low) × 3 tiles (todo/in-progress/done) from `getFilteredTasks()` counts. Each tile: `data-priority`, `data-status`, count, status sublabel, `.empty` when 0. Call it at the end of `renderTasks()`.
```js
function renderMobileGrid() {
  const grid = DOM.mobileGrid; if (!grid) return;
  const tasks = getFilteredTasks();
  const PRI = [['high','High'],['medium','Med'],['low','Low']];
  const ST = [['todo','To Do'],['in-progress','In Prog'],['done','Done']];
  // keep the 4 header nodes (corner + 3 colheads), rebuild rows after them
  grid.querySelectorAll('.mg-row, .mg-tile').forEach(n => n.remove());
  PRI.forEach(([p,pl]) => {
    const rh = document.createElement('div');
    rh.className = 'mg-row mg-rowhead pri-' + p;
    rh.innerHTML = `<span class="mg-rl">${pl}</span>`;
    grid.appendChild(rh);
    ST.forEach(([s,sl]) => {
      const n = tasks.filter(t => t.priority===p && t.status===s).length;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'mg-tile pri-' + p + (n===0 ? ' empty' : '');
      tile.dataset.priority = p; tile.dataset.status = s;
      tile.innerHTML = `<span class="mg-count">${n}</span><span class="mg-sub">${sl}</span>`;
      grid.appendChild(tile);
    });
  });
}
```
- [ ] **2.3** `app.js` — add `mobileGrid: document.getElementById('mobile-grid')` to DOM.
- [ ] **2.4** `style.css` — grid + Variant B tiles (white, top accent bar, dark count), shown only on mobile:
```css
.mobile-grid { display:none; }
@media (max-width:768px) { html .mobile-grid, html.force-mobile .mobile-grid {
  display:grid; grid-template-columns:auto 1fr 1fr 1fr; gap:8px; }
}
/* (full tile CSS — see Task 2 detail block in style.css) */
.mg-tile { position:relative; min-height:64px; border:1px solid var(--border-color); border-radius:12px; background:var(--bg-card); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer; overflow:hidden; }
.mg-tile::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:hsl(var(--hue),70%,52%); }
.mg-tile.pri-high{--hue:var(--priority-high-hue);} .mg-tile.pri-medium{--hue:var(--priority-medium-hue);} .mg-tile.pri-low{--hue:var(--priority-low-hue);}
.mg-count { font-family:var(--font-title); font-weight:800; font-size:1.5rem; color:var(--text-primary); }
.mg-sub { font-size:.6rem; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted); }
.mg-tile.empty { opacity:.45; } .mg-tile:active { transform:scale(.97); }
```
- [ ] **2.5** `style.css` — hide the desktop matrix (`.matrix-header-row`, `.matrix-row`) on mobile (the grid replaces it); remove the old `.board-mobile-tabs`/`.board-priority-chips`/status-tab/priority-chip rules.

**Verify:** screenshot mobile board → grid of 9 tiles, Variant B look, counts correct.

---

### Task 3: Drill-in full-screen list

**Files:** Modify `index.html`, `style.css`, `app.js`.

- [ ] **3.1** `index.html` — add drill-in panel inside `.main-content` (after content-body):
```html
<div class="drill-panel" id="drill-panel" hidden>
  <div class="drill-head">
    <button type="button" class="drill-back" id="drill-back" aria-label="Back"><i class="ri-arrow-left-line"></i></button>
    <div class="drill-title" id="drill-title"></div>
  </div>
  <div class="drill-list" id="drill-list"></div>
</div>
```
- [ ] **3.2** `app.js` — DOM refs `drillPanel, drillTitle, drillList, drillBack`. Add open/close:
```js
let drillCell = null; // {priority, status}
function openDrill(priority, status) {
  drillCell = { priority, status };
  const PL = {high:'High',medium:'Medium',low:'Low'}, SL = {todo:'To Do','in-progress':'In Progress',done:'Done'};
  DOM.drillTitle.textContent = `${PL[priority]} · ${SL[status]}`;
  renderDrillList();
  DOM.drillPanel.hidden = false;
  requestAnimationFrame(() => DOM.drillPanel.classList.add('open'));
}
function closeDrill() {
  DOM.drillPanel.classList.remove('open');
  drillCell = null;
  setTimeout(() => { DOM.drillPanel.hidden = true; }, 250);
}
function renderDrillList() {
  if (!drillCell) return;
  const { priority, status } = drillCell;
  const tasks = getFilteredTasks().filter(t => t.priority===priority && t.status===status)
    .sort((a,b)=>(a.order||0)-(b.order||0));
  DOM.drillList.innerHTML = '';
  const add = document.createElement('button');
  add.type='button'; add.className='drill-add';
  add.innerHTML = `<i class="ri-add-line"></i> Add to ${DOM.drillTitle.textContent}`;
  add.addEventListener('click', () => openTaskModalPrefilled(priority, status));
  DOM.drillList.appendChild(add);
  if (!tasks.length) {
    const e = document.createElement('p'); e.className='drill-empty'; e.textContent='No tasks here yet.';
    DOM.drillList.appendChild(e);
  } else tasks.forEach(t => DOM.drillList.appendChild(createTaskCard(t)));
}
```
- [ ] **3.3** `app.js` — wire tile clicks (delegate on grid) + back button, in setupEventListeners:
```js
DOM.mobileGrid.addEventListener('click', (e) => {
  const tile = e.target.closest('.mg-tile'); if (tile) openDrill(tile.dataset.priority, tile.dataset.status);
});
DOM.drillBack.addEventListener('click', closeDrill);
```
- [ ] **3.4** `app.js` — after any task mutation, if drill open, refresh it. In `renderTasks()` end: `if (drillCell) renderDrillList();`
- [ ] **3.5** `style.css` — drill panel slides over the column (fixed within force-mobile body / mobile viewport):
```css
.drill-panel[hidden] { display:none; }
@media (max-width:768px), (min-width:0) { /* see force-mobile note */ }
.drill-panel { position:fixed; inset:0; z-index:50; background:var(--bg-gradient); display:flex; flex-direction:column; transform:translateX(100%); transition:transform .25s ease; }
.drill-panel.open { transform:translateX(0); }
.drill-head { display:flex; align-items:center; gap:10px; padding:16px; background:var(--bg-panel); border-bottom:1px solid var(--border-color); }
.drill-back { background:none; border:none; font-size:1.4rem; color:var(--text-primary); cursor:pointer; }
.drill-title { font-family:var(--font-title); font-weight:700; }
.drill-list { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; }
.drill-add { display:flex; align-items:center; gap:8px; padding:12px 14px; border:1px dashed var(--border-color); border-radius:12px; background:none; color:var(--primary); font-weight:600; cursor:pointer; }
.drill-empty { color:var(--text-muted); text-align:center; padding:24px; }
/* drill-panel only active on mobile/force-mobile; on desktop it stays hidden via hidden attr */
```

**Verify:** screenshot `?` → tap a tile (sim via click) → panel shows that cell's cards + "Add to …"; back returns.

---

### Task 4: Title-first quick-add + contextual prefill

**Files:** Modify `index.html`, `style.css`, `app.js`.

- [ ] **4.1** `index.html` — add quick-add sheet + scrim before modals:
```html
<div class="qa-scrim" id="qa-scrim" hidden></div>
<div class="qa-sheet" id="qa-sheet" hidden>
  <h3>New task</h3>
  <input type="text" id="qa-title" placeholder="What needs to be done?" autocomplete="off">
  <div class="qa-ctx" id="qa-ctx"></div>
  <button type="button" class="qa-more" id="qa-more"><i class="ri-arrow-down-s-line"></i> More options</button>
  <button type="button" class="qa-save" id="qa-save">Save task</button>
</div>
```
- [ ] **4.2** `app.js` — DOM refs (`qaScrim, qaSheet, qaTitle, qaCtx, qaMore, qaSave`). State `qaPrefill = {priority:'medium', status:'todo'}`.
```js
function openQuickAdd(priority='medium', status='todo') {
  qaPrefill = { priority, status };
  const PL={high:'High',medium:'Medium',low:'Low'}, SL={todo:'To Do','in-progress':'In Progress',done:'Done'};
  const catName = state.filterCategory!=='all' ? (state.categories.find(c=>c.id===state.filterCategory)?.name||'') : (state.categories[0]?.name||'');
  DOM.qaCtx.innerHTML = `<span>${SL[status]}</span><span>${PL[priority]}</span>` + (catName?`<span>${escapeHTML(catName)}</span>`:'');
  DOM.qaTitle.value = '';
  DOM.qaScrim.hidden = false; DOM.qaSheet.hidden = false;
  requestAnimationFrame(()=>{ DOM.qaSheet.classList.add('open'); DOM.qaScrim.classList.add('open'); });
  setTimeout(()=>DOM.qaTitle.focus(), 60);
}
function closeQuickAdd(){ DOM.qaSheet.classList.remove('open'); DOM.qaScrim.classList.remove('open'); setTimeout(()=>{DOM.qaSheet.hidden=true;DOM.qaScrim.hidden=true;},200); }
function saveQuickAdd(){
  const title = DOM.qaTitle.value.trim(); if(!title) return;
  const catId = state.filterCategory!=='all' ? state.filterCategory : (state.categories[0]?.id || null);
  const task = { id:genId(), title, description:'', category:catId, priority:qaPrefill.priority, status:qaPrefill.status, dueDate:'', subtasks:[], order:Date.now() };
  state.tasks.push(task); persistTaskUpsert(task); closeQuickAdd(); renderTasks(); updateStats();
}
function openTaskModalPrefilled(priority, status){ openQuickAdd(priority, status); }
```
- [ ] **4.3** `app.js` — wire: bottom-nav Add → `openQuickAdd()`; `qa-save` → saveQuickAdd; `qa-scrim` → closeQuickAdd; `qa-more` → `closeQuickAdd(); openTaskModal()` then preset its priority/status/category selects to the prefill (reuse existing full modal for advanced).
- [ ] **4.4** `style.css` — sheet + scrim (bottom sheet within mobile/force-mobile):
```css
.qa-scrim[hidden],.qa-sheet[hidden]{display:none;}
.qa-scrim{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.4);opacity:0;transition:opacity .2s;}
.qa-scrim.open{opacity:1;}
.qa-sheet{position:fixed;left:0;right:0;bottom:0;z-index:61;background:var(--bg-panel);border-radius:18px 18px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));transform:translateY(110%);transition:transform .25s ease;box-shadow:0 -8px 30px rgba(0,0,0,.3);}
.qa-sheet.open{transform:translateY(0);}
.qa-sheet h3{font-family:var(--font-title);font-size:1rem;margin-bottom:12px;}
.qa-sheet input{width:100%;min-height:48px;padding:12px 14px;font-size:16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-input);color:var(--text-primary);}
.qa-ctx{display:flex;gap:8px;margin:10px 0;}
.qa-ctx span{font-size:.7rem;background:var(--bg-input);padding:6px 10px;border-radius:999px;color:var(--text-secondary);}
.qa-more{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-secondary);font-weight:600;font-size:.82rem;margin:4px 2px 12px;cursor:pointer;}
.qa-save{width:100%;min-height:48px;border:none;border-radius:8px;background:var(--primary);color:#fff;font-weight:700;font-size:.95rem;cursor:pointer;}
```

**Verify:** screenshot sheet open (defaults chips, title focus); add a task → appears in grid count + drill list.

---

### Task 5: Verify + commit

- [ ] **5.1** `node --check app.js`.
- [ ] **5.2** Headless screenshots: force-mobile column (light + dark) — grid, drill-in, quick-add. Confirm no horizontal overflow (`docSW==innerW`).
- [ ] **5.3** Confirm desktop view unchanged (toggle off, ≥769px): matrix board intact.
- [ ] **5.4** Commit: `feat: mobile matrix-grid view with drill-in, quick-add, and desktop/mobile toggle`.

---

## Self-Review
- **Coverage:** Req1 toggle = Task 1. Req2 easy add = Task 4. Req3 default kanban = grid is the board default (Task 2). Req4 see tasks only via intersection = Tasks 2+3 (tiles → drill-in). ✓
- **Type consistency:** `openDrill/closeDrill/renderDrillList` use `drillCell`; `openQuickAdd/saveQuickAdd/closeQuickAdd` use `qaPrefill`; grid uses `data-priority/data-status` matching `createTaskCard` task fields. ✓
- **Reuse:** drill list reuses `createTaskCard`; quick-add reuses `genId/persistTaskUpsert/getFilteredTasks`; "More" reuses existing full `openTaskModal`. ✓
- **Open risk:** force-mobile `transform:translateZ(0)` on body must contain the fixed drill/sheet/nav — verify in Task 5; if a fixed child escapes, constrain it to the column explicitly.
