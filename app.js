// APEX TASKS - CORE APPLICATION LOGIC

// --- Default Seed Data ---
const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Work', color: '#6366f1' },       // Indigo
  { id: 'cat-personal', name: 'Personal', color: '#ec4899' },   // Pink
  { id: 'cat-shopping', name: 'Shopping', color: '#10b981' },   // Emerald
  { id: 'cat-wellness', name: 'Wellness', color: '#f59e0b' }    // Amber
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Design Checkmate Glassmorphic Interface',
    description: 'Sketch layout prototypes with glassmorphic cards, gradients, and a dark/light design system variables.',
    category: 'cat-work',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // Today
    status: 'done',
    subtasks: [
      { id: 'sub-1-1', text: 'Select curated HSL color palette', completed: true },
      { id: 'sub-1-2', text: 'Define responsive grid break points', completed: true }
    ],
    order: 0
  },
  {
    id: 'task-2',
    title: 'Develop drag and drop core mechanics',
    description: 'Implement HTML5 drag & drop listeners with dynamic insert indicators and CSS animations.',
    category: 'cat-work',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    status: 'in-progress',
    subtasks: [
      { id: 'sub-2-1', text: 'Bind dragstart and dragend styles', completed: true },
      { id: 'sub-2-2', text: 'Calculate visual drop thresholds', completed: false }
    ],
    order: 0
  },
  {
    id: 'task-3',
    title: 'Weekly grocery list prep',
    description: 'Pick fresh organic vegetables, oat milk, wholewheat bread, and coffee blends.',
    category: 'cat-shopping',
    priority: 'low',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 Days from now
    status: 'todo',
    subtasks: [
      { id: 'sub-3-1', text: 'Almond or oat milk (2L)', completed: false },
      { id: 'sub-3-2', text: 'Single origin espresso beans', completed: false }
    ],
    order: 0
  },
  {
    id: 'task-4',
    title: 'Cardio training & stretching',
    description: 'Complete a 5km outdoor run followed by full-body mobility exercises.',
    category: 'cat-wellness',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue!)
    status: 'todo',
    subtasks: [
      { id: 'sub-4-1', text: '5km tempo run', completed: false },
      { id: 'sub-4-2', text: '15-minute foam rolling', completed: false }
    ],
    order: 1
  }
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#0891b2', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#64748b'  // Slate
  ];

// --- Application State ---
let state = {
  tasks: [],
  categories: [],
  activeView: 'board', // 'board' | 'list'
  filterCategory: 'all', // 'all' | categoryId
  searchQuery: '',
  selectedSidebarCategory: 'all', // 'all' | categoryId
  theme: 'light', // 'dark' | 'light' | 'system'
  tempSubtasks: [], // Array of subtasks for current modal workspace

  // Profile + settings (persisted to Supabase auth user_metadata; localStorage mirror)
  profile: { displayName: '', avatarColor: '#6366f1', timezone: '' },
  settings: {
    defaultView: 'board', defaultPriority: 'medium', weekStart: 'sun',
    dateFormat: 'mmdd', density: 'comfortable', confirmDelete: true, showCompleted: true
  }
};

// --- DOM Cache References ---
const DOM = {
  app: document.getElementById('app'),

  navBoardView: document.getElementById('nav-board-view'),
  navListView: document.getElementById('nav-list-view'),
  viewBoardBtn: document.getElementById('view-board-btn'),
  viewListBtn: document.getElementById('view-list-btn'),
  
  sidebarCategories: document.getElementById('sidebar-categories'),
  openCategoryModalBtn: document.getElementById('open-category-modal-btn'),
  categoryModal: document.getElementById('category-modal'),
  categoryForm: document.getElementById('category-form'),
  categoryFormName: document.getElementById('category-form-name'),
  categoryFormColor: document.getElementById('category-form-color'),
  colorPresetsRow: document.getElementById('color-presets-row'),
  closeCategoryModalBtn: document.getElementById('close-category-modal-btn'),
  cancelCategoryFormBtn: document.getElementById('cancel-category-form-btn'),
  
  taskSearchInput: document.getElementById('task-search-input'),
  taskFilterCategory: document.getElementById('task-filter-category'),
  openTaskModalBtn: document.getElementById('open-task-modal-btn'),
  
  taskModal: document.getElementById('task-modal'),
  taskModalTitle: document.getElementById('task-modal-title'),
  taskForm: document.getElementById('task-form'),
  taskFormId: document.getElementById('task-form-id'),
  taskFormTitle: document.getElementById('task-form-title'),
  taskFormDesc: document.getElementById('task-form-desc'),
  taskFormCategory: document.getElementById('task-form-category'),
  taskFormPriority: document.getElementById('task-form-priority'),
  taskFormDueDate: document.getElementById('task-form-dueDate'),
  taskFormStatus: document.getElementById('task-form-status'),
  closeTaskModalBtn: document.getElementById('close-task-modal-btn'),
  cancelTaskFormBtn: document.getElementById('cancel-task-form-btn'),
  
  subtaskAddInput: document.getElementById('subtask-add-input'),
  subtaskAddBtn: document.getElementById('subtask-add-btn'),
  modalSubtaskList: document.getElementById('modal-subtask-list'),
  
  progressCircle: document.getElementById('progress-circle'),
  progressPercentageLabel: document.getElementById('progress-percentage-label'),
  statsCompletionFraction: document.getElementById('stats-completion-fraction'),
  statsActiveCount: document.getElementById('stats-active-count'),
  statsOverdueCount: document.getElementById('stats-overdue-count'),
  
  workspaceBoard: document.getElementById('workspace-board'),
  workspaceList: document.getElementById('workspace-list'),
  

  todoCount: document.getElementById('todo-count'),
  progressCount: document.getElementById('progress-count'),
  doneCount: document.getElementById('done-count'),

  // Auth gate + account panel
  authOverlay: document.getElementById('auth-overlay'),
  authGoogleBtn: document.getElementById('auth-google-btn'),
  authForm: document.getElementById('auth-form'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  authMessage: document.getElementById('auth-message'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),
  authToggleBtn: document.getElementById('auth-toggle-btn'),
  authToggleText: document.getElementById('auth-toggle-text'),
  accountPanel: document.getElementById('account-panel'),
  accountEmail: document.getElementById('account-email'),
  accountAvatar: document.getElementById('account-avatar'),
  signoutBtn: document.getElementById('signout-btn'),

  // Top-bar controls + profile menu (shared desktop + mobile)
  viewportToggleBtn: document.getElementById('viewport-toggle-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  profileMenuBtn: document.getElementById('account-avatar-btn'),
  accountAvatarBtn: document.getElementById('account-avatar-btn'),
  profileMenu: document.getElementById('account-popover'),
  pmName: document.getElementById('account-popover-name'),
  pmEmail: document.getElementById('account-popover-email'),
  accountPopoverEmail: document.getElementById('account-popover-email'),
  pmProfile: document.getElementById('pm-profile'),
  pmSettings: document.getElementById('pm-settings'),
  accountPopoverSignout: document.getElementById('account-popover-signout'),

  // Profile modal
  profileModal: document.getElementById('profile-modal'),
  profileName: document.getElementById('profile-name'),
  profileEmail: document.getElementById('profile-email'),
  profileTimezone: document.getElementById('profile-timezone'),
  profileAvatarPreview: document.getElementById('profile-avatar-preview'),
  profileColorDots: document.getElementById('profile-color-dots'),
  profileSaveBtn: document.getElementById('profile-save-btn'),
  profileCancelBtn: document.getElementById('profile-cancel-btn'),
  profileCloseBtn: document.getElementById('profile-close-btn'),

  // Settings modal
  settingsModal: document.getElementById('settings-modal'),
  settingsCloseBtn: document.getElementById('settings-close-btn'),
  settingsDoneBtn: document.getElementById('settings-done-btn'),
  setDefaultPriority: document.getElementById('set-default-priority'),
  setConfirmDelete: document.getElementById('set-confirm-delete'),
  setShowCompleted: document.getElementById('set-show-completed'),
  setChangePw: document.getElementById('set-change-pw'),
  setExport: document.getElementById('set-export'),
  setImport: document.getElementById('set-import'),
  setImportFile: document.getElementById('set-import-file'),
  setSignout: document.getElementById('set-signout'),

  categoryChips: document.getElementById('category-chips'),
  mobileGrid: document.getElementById('mobile-grid'),
  drillPanel: document.getElementById('drill-panel'),
  drillTitle: document.getElementById('drill-title'),
  drillList: document.getElementById('drill-list'),
  drillBack: document.getElementById('drill-back'),
  qaScrim: document.getElementById('qa-scrim'),
  qaSheet: document.getElementById('qa-sheet'),
  qaTitle: document.getElementById('qa-title'),
  qaCtx: document.getElementById('qa-ctx'),
  qaMore: document.getElementById('qa-more'),
  qaSave: document.getElementById('qa-save'),
  bottomNavBoard: document.getElementById('bottom-nav-board'),
  bottomNavList: document.getElementById('bottom-nav-list'),
  bottomNavAdd: document.getElementById('bottom-nav-add')
};

// --- Cloud vs local mode ----------------------------------------------------
// CLOUD = Supabase configured (keys present in config.js). When false, the app
// runs exactly as before against localStorage, so it still works pre-setup.
const CLOUD = !!(window.DB && window.DB.Auth.isConfigured());
let authMode = 'signin'; // 'signin' | 'signup'
let realtimeTimer = null;

// Generate an id. Cloud needs valid UUIDs (uuid PK columns); crypto.randomUUID
// works on HTTPS and localhost. Falls back to a timestamp id if unavailable.
function genId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- Boot / initialization -------------------------------------------------
// Wires up listeners once, then either gates behind auth (cloud) or runs
// directly against localStorage (local fallback).
function boot() {
  applyTheme();
  applyViewport();
  setupEventListeners();
  setupPresetColorsPicker();
  setupAuthListeners();

  if (!CLOUD) {
    // Local-only mode: behave exactly like the original app.
    loadLocalData();
    renderApp();
    return;
  }

  // Cloud mode: show the auth gate (covers the app) until the session resolves.
  DOM.authOverlay.hidden = false;
  DB.Auth.onChange((session) => handleSession(session));
  DB.Auth.getSession().then((session) => handleSession(session));
}

// Render the full UI pipeline from current state.
function renderApp() {
  renderCategories();
  renderTasks();
  updateStats();
}

// --- Auth session handling (cloud) ------------------------------------------
let activeUserId = null; // guards against duplicate session events on load

async function handleSession(session) {
  if (session && session.user) {
    // Already loaded for this user? (INITIAL_SESSION + getSession both fire.)
    if (activeUserId === session.user.id) return;
    activeUserId = session.user.id;

    // Signed in.
    DOM.authOverlay.hidden = true;
    DOM.accountPanel.hidden = false;
    const email = session.user.email || '';
    userEmail = email;
    DOM.accountEmail.textContent = email;
    DOM.accountAvatar.textContent = (email[0] || '?').toUpperCase();
    loadProfileSettings(session.user.user_metadata || {});

    await loadCloudData();
    applyProfile();
    renderApp();
    subscribeRealtime();
  } else {
    // Signed out.
    activeUserId = null;
    DB.unsubscribe();
    DOM.accountPanel.hidden = true;
    DOM.authOverlay.hidden = false;
    state.tasks = [];
    state.categories = [];
  }
}

// --- Data loading -----------------------------------------------------------
function loadLocalData() {
  // Migrate from old apex_* keys if checkmate_* keys don't exist yet
  if (!localStorage.getItem('checkmate_tasks') && localStorage.getItem('apex_tasks')) {
    localStorage.setItem('checkmate_tasks', localStorage.getItem('apex_tasks'));
    localStorage.setItem('checkmate_categories', localStorage.getItem('apex_categories') || '');
    localStorage.setItem('checkmate_theme', localStorage.getItem('apex_theme') || '');
    localStorage.setItem('checkmate_view', localStorage.getItem('apex_view') || '');
  }

  const savedTasks = localStorage.getItem('checkmate_tasks');
  const savedCategories = localStorage.getItem('checkmate_categories');
  const savedTheme = localStorage.getItem('checkmate_theme');
  const savedView = localStorage.getItem('checkmate_view');

  state.tasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS;
  state.categories = savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
  state.theme = savedTheme ? savedTheme : 'light';
  state.activeView = savedView ? savedView : 'board';

  loadProfileSettings();   // local mode: from localStorage
  applyProfile();
}

async function loadCloudData() {
  // Theme/view stay per-device in localStorage.
  state.theme = localStorage.getItem('checkmate_theme') || 'light';
  state.activeView = localStorage.getItem('checkmate_view') || 'board';
  applyTheme();

  try {
    let data = await DB.fetchAll();
    // One-time migration of this browser's localStorage tasks into the account.
    // Guard: only migrate into an EMPTY account. An account that already has
    // tasks is established (e.g. the Vercel app) — never merge a different
    // origin's local test data into it, or every new origin duplicates tasks.
    const migrated = data.tasks.length === 0
      ? await DB.migrateLocalStorageIfNeeded(data.categories)
      : false;
    if (migrated) data = await DB.fetchAll();
    state.categories = data.categories;
    state.tasks = data.tasks;
  } catch (err) {
    console.error('Failed to load cloud data:', err);
    alert('Could not load your tasks. Check your connection and refresh.');
    state.categories = [];
    state.tasks = [];
  }
}

// Reload from cloud (used by realtime). View-only refresh, no writes.
async function reloadFromCloud() {
  try {
    const data = await DB.fetchAll();
    state.categories = data.categories;
    state.tasks = data.tasks;
    renderApp();
  } catch (err) {
    console.error('Realtime reload failed:', err);
  }
}

// --- Persistence wrappers ---------------------------------------------------
// In cloud mode these make granular DB writes; in local mode they fall through
// to a full localStorage save. Mutation functions call these instead of saving
// directly, so the same code path works in both modes.
function saveUIPrefs() {
  localStorage.setItem('checkmate_theme', state.theme);
  localStorage.setItem('checkmate_view', state.activeView);
}

function saveLocal() {
  localStorage.setItem('checkmate_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('checkmate_categories', JSON.stringify(state.categories));
  saveUIPrefs();
}

// Kept for UI-pref-only call sites (theme/view changes).
function saveData() {
  if (CLOUD) saveUIPrefs();
  else saveLocal();
}

function persistTaskUpsert(task) {
  if (!CLOUD) return saveLocal();
  DB.upsertTask(task).catch(err => console.error('Save task failed:', err));
}
function persistTaskDelete(id) {
  if (!CLOUD) return saveLocal();
  DB.deleteTask(id).catch(err => console.error('Delete task failed:', err));
}
function persistTasksBulk(tasks) {
  if (!CLOUD) return saveLocal();
  DB.upsertTasks(tasks).catch(err => console.error('Save tasks failed:', err));
}
function persistCategoryInsert(cat) {
  if (!CLOUD) return saveLocal();
  DB.insertCategory(cat).catch(err => console.error('Add category failed:', err));
}
function persistCategoryUpdate(cat) {
  if (!CLOUD) return saveLocal();
  DB.updateCategory(cat).catch(err => console.error('Update category failed:', err));
}
function persistCategoryDelete(id) {
  if (!CLOUD) return saveLocal();
  DB.deleteCategory(id).catch(err => console.error('Delete category failed:', err));
}
function persistCategoriesReorder(cats) {
  if (!CLOUD) return saveLocal();
  DB.reorderCategories(cats).catch(err => console.error('Reorder categories failed:', err));
}

// --- Realtime ---------------------------------------------------------------
function subscribeRealtime() {
  if (!CLOUD) return;
  DB.subscribe(() => {
    // Debounce: collapse bursts of change events into one reload.
    clearTimeout(realtimeTimer);
    realtimeTimer = setTimeout(reloadFromCloud, 250);
  });
}

// --- Theme Implementation ---
function applyTheme() {
  const root = document.documentElement;
  let activeTheme = state.theme;
  
  if (state.theme === 'system') {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  root.setAttribute('data-theme', activeTheme);
  
  // Sync the one-tap top-bar toggle icon and (if open) the Settings theme control.
  syncThemeToggleIcon();
  if (DOM.settingsModal && typeof setSeg === 'function') setSeg('theme', state.theme);
}

// Handle system theme updates dynamically
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

// --- Mobile view ------------------------------------------------------------
// The mobile layout is driven by a `mobile-mode` class on <html>, set by JS when
// the screen is <=768px OR the in-app preview toggle (forceMobile) is on. The
// toggle additionally adds `force-mobile`, which renders the app in a centered
// ~400px column on a laptop. Board on mobile = a 3x3 status/priority count grid
// (renderMobileGrid); tapping a tile drills into that intersection (openDrill).

const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
let forceMobile = localStorage.getItem('checkmate_force_mobile') === '1';

function applyViewport() {
  const root = document.documentElement;
  const realMobile = MOBILE_MQ.matches;
  const mobile = forceMobile || realMobile;
  root.classList.toggle('mobile-mode', mobile);
  root.classList.toggle('force-mobile', forceMobile && !realMobile);
  if (DOM.viewportToggleBtn) {
    DOM.viewportToggleBtn.setAttribute('aria-pressed', String(forceMobile));
    const i = DOM.viewportToggleBtn.querySelector('i');
    if (i) i.className = forceMobile ? 'ri-computer-line' : 'ri-smartphone-line';
    DOM.viewportToggleBtn.title = forceMobile ? 'Switch to desktop view' : 'Preview mobile';
  }
  if (!mobile) closeDrill();
}

function toggleViewport() {
  forceMobile = !forceMobile;
  localStorage.setItem('checkmate_force_mobile', forceMobile ? '1' : '0');
  applyViewport();
}

// Resolve the theme actually painted (handles the 'system' setting).
function resolveActiveTheme() {
  if (state.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.theme;
}

// One-tap light<->dark toggle (mobile top bar). Flips the currently painted theme.
function toggleTheme() {
  state.theme = resolveActiveTheme() === 'dark' ? 'light' : 'dark';
  saveData();
  applyTheme();
}

// Keep the sun/moon icon in sync with the painted theme.
function syncThemeToggleIcon() {
  if (!DOM.themeToggleBtn) return;
  const dark = resolveActiveTheme() === 'dark';
  const icon = DOM.themeToggleBtn.querySelector('i');
  if (icon) icon.className = dark ? 'ri-sun-line' : 'ri-moon-line';
  DOM.themeToggleBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

// Mobile board: 3x3 grid of status/priority count tiles built from filtered tasks.
const MOBILE_PRI = [['high', 'High'], ['medium', 'Med'], ['low', 'Low']];
const MOBILE_ST = [['todo', 'To Do'], ['in-progress', 'In Prog'], ['done', 'Done']];

function renderMobileGrid() {
  const grid = DOM.mobileGrid;
  if (!grid) return;
  const tasks = getFilteredTasks();
  grid.querySelectorAll('.mg-rowhead, .mg-tile').forEach(n => n.remove());
  MOBILE_PRI.forEach(([p, pl]) => {
    const rh = document.createElement('div');
    rh.className = 'mg-rowhead pri-' + p;
    rh.innerHTML = `<span class="mg-rl">${pl}</span>`;
    grid.appendChild(rh);
    MOBILE_ST.forEach(([s, sl]) => {
      const n = tasks.filter(t => t.priority === p && t.status === s).length;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'mg-tile pri-' + p + (n === 0 ? ' empty' : '');
      tile.dataset.priority = p;
      tile.dataset.status = s;
      tile.innerHTML = `<span class="mg-count">${n}</span><span class="mg-sub">${sl}</span>`;
      grid.appendChild(tile);
    });
  });
}

// Drill-in: full-screen list of one status/priority intersection.
let drillCell = null; // { priority, status }
const PRI_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
const ST_LABEL = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

function openDrill(priority, status) {
  drillCell = { priority, status };
  DOM.drillTitle.textContent = `${PRI_LABEL[priority]} · ${ST_LABEL[status]}`;
  renderDrillList();
  DOM.drillPanel.hidden = false;
  requestAnimationFrame(() => DOM.drillPanel.classList.add('open'));
}

function closeDrill() {
  if (!DOM.drillPanel || DOM.drillPanel.hidden) { drillCell = null; return; }
  DOM.drillPanel.classList.remove('open');
  drillCell = null;
  setTimeout(() => { DOM.drillPanel.hidden = true; }, 250);
}

function renderDrillList() {
  if (!drillCell || !DOM.drillList) return;
  const { priority, status } = drillCell;
  const tasks = getFilteredTasks()
    .filter(t => t.priority === priority && t.status === status)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  DOM.drillList.innerHTML = '';
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'drill-add';
  add.innerHTML = `<i class="ri-add-line"></i> Add to ${PRI_LABEL[priority]} · ${ST_LABEL[status]}`;
  add.addEventListener('click', () => openQuickAdd(priority, status));
  DOM.drillList.appendChild(add);
  if (!tasks.length) {
    const e = document.createElement('p');
    e.className = 'drill-empty';
    e.textContent = 'No tasks here yet.';
    DOM.drillList.appendChild(e);
  } else {
    tasks.forEach(t => DOM.drillList.appendChild(createTaskCard(t)));
  }
}

// Title-first quick-add sheet (mobile). Defaults To Do / Medium / current category;
// "More options" hands off to the full task modal. Contextual prefill from a cell.
let qaPrefill = { priority: 'medium', status: 'todo' };

function openQuickAdd(priority, status = 'todo') {
  if (!priority) priority = state.settings.defaultPriority || 'medium';
  qaPrefill = { priority, status };
  const catName = state.filterCategory !== 'all'
    ? (state.categories.find(c => c.id === state.filterCategory)?.name || '')
    : (state.categories[0]?.name || '');
  DOM.qaCtx.innerHTML = `<span>${ST_LABEL[status]}</span><span>${PRI_LABEL[priority]}</span>`
    + (catName ? `<span>${escapeHTML(catName)}</span>` : '');
  DOM.qaTitle.value = '';
  DOM.qaScrim.hidden = false;
  DOM.qaSheet.hidden = false;
  requestAnimationFrame(() => { DOM.qaSheet.classList.add('open'); DOM.qaScrim.classList.add('open'); });
  setTimeout(() => DOM.qaTitle.focus(), 60);
}

function closeQuickAdd() {
  DOM.qaSheet.classList.remove('open');
  DOM.qaScrim.classList.remove('open');
  setTimeout(() => { DOM.qaSheet.hidden = true; DOM.qaScrim.hidden = true; }, 200);
}

function saveQuickAdd() {
  const title = DOM.qaTitle.value.trim();
  if (!title) { DOM.qaTitle.focus(); return; }
  const catId = state.filterCategory !== 'all' ? state.filterCategory : (state.categories[0]?.id || null);
  const task = {
    id: genId(), title, description: '', category: catId,
    priority: qaPrefill.priority, status: qaPrefill.status,
    dueDate: '', subtasks: [], order: Date.now()
  };
  state.tasks.push(task);
  persistTaskUpsert(task);
  closeQuickAdd();
  renderTasks();
  updateStats();
}

// "More options" — close the quick sheet and open the full modal, prefilled.
function quickAddMore() {
  const pri = qaPrefill.priority, st = qaPrefill.status, title = DOM.qaTitle.value.trim();
  closeQuickAdd();
  openTaskModal();
  DOM.taskFormTitle.value = title;
  DOM.taskFormPriority.value = pri;
  DOM.taskFormStatus.value = st;
  if (state.filterCategory !== 'all') DOM.taskFormCategory.value = state.filterCategory;
}

// Single source of truth for the category filter (top dropdown + mobile chips +
// sidebar all stay in sync). 'all' or a category id.
function setCategoryFilter(catId) {
  state.filterCategory = catId;
  state.selectedSidebarCategory = catId;
  if (DOM.taskFilterCategory) DOM.taskFilterCategory.value = catId;
  document.querySelectorAll('.category-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.cat === catId);
  });
  document.querySelectorAll('.category-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.cat === catId);
  });
  renderTasks();
}

// Render the horizontal category chip row (mobile quick category nav).
function renderCategoryChips() {
  if (!DOM.categoryChips) return;
  const chips = [{ id: 'all', name: 'All', color: 'var(--primary)' }]
    .concat(state.categories.map(c => ({ id: c.id, name: c.name, color: c.color })));
  DOM.categoryChips.innerHTML = chips.map(c =>
    `<button type="button" class="category-chip${state.filterCategory === c.id ? ' active' : ''}" data-cat="${c.id}">
       <span class="category-chip-dot" style="background:${c.color}"></span>${escapeHTML(c.name)}
     </button>`
  ).join('');
}


// --- Profile & Settings -----------------------------------------------------
const AVATAR_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
const TIMEZONES = [
  '(GMT-08:00) Pacific', '(GMT-05:00) Eastern', '(GMT+00:00) UTC',
  '(GMT+01:00) Central Europe', '(GMT+03:00) Moscow', '(GMT+04:00) Gulf',
  '(GMT+05:30) India Standard Time', '(GMT+07:00) Bangkok',
  '(GMT+08:00) Singapore', '(GMT+09:00) Tokyo', '(GMT+10:00) Sydney'
];
let userEmail = '';

// Load profile + settings from cloud user_metadata (or localStorage in local mode).
function loadProfileSettings(meta) {
  let p = {}, s = {};
  if (meta) {
    p = { displayName: meta.display_name || '', avatarColor: meta.avatar_color || '', timezone: meta.timezone || '' };
    s = meta.settings || {};
  } else {
    try { p = JSON.parse(localStorage.getItem('checkmate_profile') || '{}'); } catch (_) {}
    try { s = JSON.parse(localStorage.getItem('checkmate_settings') || '{}'); } catch (_) {}
  }
  state.profile = { ...state.profile, ...p };
  if (!state.profile.avatarColor) state.profile.avatarColor = AVATAR_COLORS[0];
  state.settings = { ...state.settings, ...s };
  // On a fresh browser (no saved view), open in the preferred default view.
  if (!localStorage.getItem('checkmate_view')) state.activeView = state.settings.defaultView;
  applyDensity();
}

// Persist profile + settings: cloud -> user_metadata; always mirror to localStorage.
function saveProfileSettings() {
  localStorage.setItem('checkmate_profile', JSON.stringify(state.profile));
  localStorage.setItem('checkmate_settings', JSON.stringify(state.settings));
  if (CLOUD && DB.Auth.getUser()) {
    DB.Auth.updateUser({
      display_name: state.profile.displayName,
      avatar_color: state.profile.avatarColor,
      timezone: state.profile.timezone,
      settings: state.settings
    }).catch(err => console.error('Save profile/settings failed:', err));
  }
}

function applyDensity() {
  document.documentElement.classList.toggle('density-compact', state.settings.density === 'compact');
}

// Avatar text = first letter of display name, else email; color from profile.
function applyProfile() {
  const initial = (state.profile.displayName || userEmail || '?').trim().charAt(0).toUpperCase() || '?';
  const color = state.profile.avatarColor || AVATAR_COLORS[0];
  [DOM.profileMenuBtn, DOM.accountAvatarBtn].forEach(el => {
    if (el) { el.textContent = initial; el.style.background = color; }
  });
  if (DOM.pmName) DOM.pmName.textContent = state.profile.displayName || 'Your account';
  if (DOM.pmEmail) DOM.pmEmail.textContent = userEmail;
  if (DOM.accountPopoverEmail) DOM.accountPopoverEmail.textContent = userEmail;
}

// Profile dropdown menu (desktop + mobile share the same menu element).
function toggleProfileMenu(force) {
  if (!DOM.profileMenu) return;
  const open = force != null ? force : DOM.profileMenu.hidden;
  DOM.profileMenu.hidden = !open;
}

// --- Profile modal ---
let tempAvatarColor = '#6366f1';
function openProfileModal() {
  toggleProfileMenu(false);
  tempAvatarColor = state.profile.avatarColor || AVATAR_COLORS[0];
  DOM.profileName.value = state.profile.displayName || '';
  DOM.profileEmail.value = userEmail;
  // timezone select
  DOM.profileTimezone.innerHTML = TIMEZONES
    .map(tz => `<option${tz === state.profile.timezone ? ' selected' : ''}>${tz}</option>`).join('');
  if (state.profile.timezone && !TIMEZONES.includes(state.profile.timezone)) {
    DOM.profileTimezone.insertAdjacentHTML('afterbegin', `<option selected>${escapeHTML(state.profile.timezone)}</option>`);
  }
  renderAvatarDots();
  openModal(DOM.profileModal);
}
function renderAvatarDots() {
  DOM.profileAvatarPreview.textContent = (DOM.profileName.value || userEmail || '?').charAt(0).toUpperCase() || '?';
  DOM.profileAvatarPreview.style.background = tempAvatarColor;
  DOM.profileColorDots.innerHTML = AVATAR_COLORS.map(c =>
    `<button type="button" class="cdot${c === tempAvatarColor ? ' sel' : ''}" data-color="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`
  ).join('');
}
function saveProfile() {
  state.profile.displayName = DOM.profileName.value.trim();
  state.profile.timezone = DOM.profileTimezone.value;
  state.profile.avatarColor = tempAvatarColor;
  saveProfileSettings();
  applyProfile();
  closeModal(DOM.profileModal);
}

// --- Settings modal ---
function openSettingsModal() {
  toggleProfileMenu(false);
  syncSettingsControls();
  openModal(DOM.settingsModal);
}
function setSeg(group, value) {
  DOM.settingsModal.querySelectorAll(`.seg[data-group="${group}"] button`).forEach(b =>
    b.classList.toggle('on', b.dataset.value === value));
}
function syncSettingsControls() {
  setSeg('theme', state.theme);
  setSeg('defaultView', state.settings.defaultView);
  setSeg('weekStart', state.settings.weekStart);
  setSeg('dateFormat', state.settings.dateFormat);
  setSeg('density', state.settings.density);
  DOM.setDefaultPriority.value = state.settings.defaultPriority;
  DOM.setConfirmDelete.classList.toggle('on', state.settings.confirmDelete);
  DOM.setShowCompleted.classList.toggle('on', state.settings.showCompleted);
}

// Delegated handler for the Settings modal: segmented controls, toggles, links.
function handleSettingsClick(e) {
  const segBtn = e.target.closest('.seg button');
  if (segBtn) {
    const group = segBtn.parentElement.dataset.group;
    const val = segBtn.dataset.value;
    if (group === 'theme') { state.theme = val; applyTheme(); }
    else { state.settings[group] = val; }
    setSeg(group, val);
    if (group === 'density') applyDensity();
    if (group === 'dateFormat' || group === 'weekStart') renderTasks();
    saveProfileSettings();
    return;
  }
  const toggle = e.target.closest('.toggle');
  if (toggle) {
    const key = toggle.dataset.key;
    state.settings[key] = !state.settings[key];
    toggle.classList.toggle('on', state.settings[key]);
    saveProfileSettings();
    if (key === 'showCompleted') renderTasks();
    return;
  }
  if (e.target.closest('#set-change-pw')) {
    if (!CLOUD || !userEmail) { alert('Password reset needs a cloud account.'); return; }
    DB.Auth.resetPassword(userEmail)
      .then(() => alert('Password reset link sent to ' + userEmail))
      .catch(err => alert('Could not send reset link: ' + err.message));
    return;
  }
  if (e.target.closest('#set-export')) { exportData(); return; }
  if (e.target.closest('#set-import')) { DOM.setImportFile.click(); return; }
  if (e.target.closest('#set-signout')) { closeModal(DOM.settingsModal); DB.Auth.signOut(); return; }
}

// Download all tasks + categories as a JSON backup.
function exportData() {
  const payload = { exportedAt: new Date().toISOString(), categories: state.categories, tasks: state.tasks };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `checkmate-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Import a previously-exported JSON file.
async function handleSettingsImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (CLOUD && DB.Auth.getUser()) {
      await DB.importData(payload);
      const data = await DB.fetchAll();
      state.categories = data.categories; state.tasks = data.tasks;
    } else {
      // Local mode: merge with fresh ids.
      (payload.categories || []).forEach(c => { if (!state.categories.some(x => x.name === c.name)) state.categories.push({ ...c, id: genId() }); });
      (payload.tasks || []).forEach(t => state.tasks.push({ ...t, id: genId() }));
      saveData();
    }
    renderApp();
    alert('Import complete.');
  } catch (err) {
    alert('Import failed: ' + err.message);
  }
  e.target.value = '';
}

// --- Category Modal Presets Picker ---
function setupPresetColorsPicker() {
  DOM.colorPresetsRow.innerHTML = '';
  PRESET_COLORS.forEach((color, index) => {
    const dot = document.createElement('div');
    dot.className = `color-dot-option${index === 0 ? ' selected' : ''}`;
    dot.style.backgroundColor = color;
    dot.dataset.color = color;
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot-option').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      DOM.categoryFormColor.value = color;
    });
    DOM.colorPresetsRow.appendChild(dot);
  });
  DOM.categoryFormColor.value = PRESET_COLORS[0];
}

// --- Category Creation & Filtering ---
function createCategory(name, color) {
  const id = genId();
  const cat = { id, name, color, order: state.categories.length };
  state.categories.push(cat);
  persistCategoryInsert(cat);
  renderCategories();
}

function deleteCategory(categoryId) {
  // Confirm deletion with warnings about associated tasks
  const hasTasks = state.tasks.some(t => t.category === categoryId);
  if (hasTasks) {
    if (!confirm('This category is used in active tasks. Deleting it will assign those tasks to "General" Category. Do you want to proceed?')) {
      return;
    }
    // Detach tasks from the deleted category (rendered as "General").
    // In cloud mode the FK ON DELETE SET NULL does this server-side too.
    state.tasks = state.tasks.map(t => {
      if (t.category === categoryId) {
        return { ...t, category: null };
      }
      return t;
    });
  }

  state.categories = state.categories.filter(c => c.id !== categoryId);

  // Handle filter state resets
  if (state.selectedSidebarCategory === categoryId) {
    state.selectedSidebarCategory = 'all';
  }
  if (state.filterCategory === categoryId) {
    state.filterCategory = 'all';
    DOM.taskFilterCategory.value = 'all';
  }

  persistCategoryDelete(categoryId);
  renderCategories();
  renderTasks();
  updateStats();
}

// --- Form Subtask Handlers ---
function addTempSubtask(text) {
  if (!text.trim()) return;
  const subtask = {
    id: `sub-temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    text: text.trim(),
    completed: false
  };
  state.tempSubtasks.push(subtask);
  DOM.subtaskAddInput.value = '';
  renderModalSubtasks();
}

function removeTempSubtask(id) {
  state.tempSubtasks = state.tempSubtasks.filter(s => s.id !== id);
  renderModalSubtasks();
}

function renderModalSubtasks() {
  DOM.modalSubtaskList.innerHTML = '';
  
  state.tempSubtasks.forEach(s => {
    const li = document.createElement('li');
    li.className = 'modal-subtask-item';
    li.innerHTML = `
      <span>${escapeHTML(s.text)}</span>
      <button type="button" class="card-btn delete" data-id="${s.id}" title="Remove step">
        <i class="ri-delete-bin-line"></i>
      </button>
    `;
    
    li.querySelector('button').addEventListener('click', () => removeTempSubtask(s.id));
    DOM.modalSubtaskList.appendChild(li);
  });
}

// --- Task CRUD Operations ---
function createOrUpdateTask(taskData) {
  const taskId = DOM.taskFormId.value;
  let saved;

  if (taskId) {
    // UPDATE
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) {
        saved = {
          ...t,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: taskData.status,
          subtasks: taskData.subtasks
        };
        return saved;
      }
      return t;
    });
  } else {
    // CREATE
    saved = {
      id: genId(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      status: taskData.status,
      subtasks: taskData.subtasks,
      order: getNextOrderValue(taskData.status, taskData.priority)
    };
    state.tasks.push(saved);
  }

  if (saved) persistTaskUpsert(saved);
  renderTasks();
  updateStats();
  closeModal(DOM.taskModal);
}

function getNextOrderValue(status, priority) {
  const cellTasks = state.tasks.filter(t => t.status === status && t.priority === priority);
  if (cellTasks.length === 0) return 0;
  return Math.max(...cellTasks.map(t => t.order || 0)) + 1;
}

function deleteTask(id) {
  // Settings: skip the confirm dialog when "confirm before delete" is off.
  if (state.settings.confirmDelete && !confirm('Are you sure you want to permanently delete this task?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  persistTaskDelete(id);
  renderTasks();
  updateStats();
}

function toggleSubtaskState(taskId, subtaskId, isChecked) {
  state.tasks = state.tasks.map(t => {
    if (t.id === taskId) {
      const updatedSubtasks = t.subtasks.map(s => {
        if (s.id === subtaskId) {
          return { ...s, completed: isChecked };
        }
        return s;
      });
      
      // Auto-move task to "Completed" if all subtasks are finished (nice helper detail)
      // Or move back to In Progress if completing nested steps. Let's keep it manual or update status.
      let nextStatus = t.status;
      if (updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed) && t.status !== 'done') {
        nextStatus = 'done';
      } else if (updatedSubtasks.some(s => !s.completed) && t.status === 'done') {
        nextStatus = 'in-progress';
      }
      
      return { ...t, subtasks: updatedSubtasks, status: nextStatus };
    }
    return t;
  });

  persistTaskUpsert(state.tasks.find(t => t.id === taskId));
  renderTasks();
  updateStats();
}

function changeTaskStatus(taskId, newStatus) {
  state.tasks = state.tasks.map(t => {
    if (t.id === taskId) {
      return { ...t, status: newStatus };
    }
    return t;
  });
  persistTaskUpsert(state.tasks.find(t => t.id === taskId));
  renderTasks();
  updateStats();
}

// --- Layout Toggles & Nav ---
function setView(viewMode) {
  state.activeView = viewMode;
  saveData();
  
  DOM.navBoardView.classList.toggle('active', viewMode === 'board');
  DOM.navListView.classList.toggle('active', viewMode === 'list');
  DOM.viewBoardBtn.classList.toggle('active', viewMode === 'board');
  DOM.viewListBtn.classList.toggle('active', viewMode === 'list');
  DOM.bottomNavBoard.classList.toggle('active', viewMode === 'board');
  DOM.bottomNavList.classList.toggle('active', viewMode === 'list');
  
  if (viewMode === 'board') {
    DOM.workspaceBoard.style.display = 'flex';
    DOM.workspaceList.style.display = 'none';
  } else {
    DOM.workspaceBoard.style.display = 'none';
    DOM.workspaceList.style.display = 'flex';
  }
  
  renderTasks();
}

// --- Render Updates ---
let dragSrcCatIndex = null;

function renderCategories() {
  // 1. Sidebar list
  DOM.sidebarCategories.innerHTML = '';
  
  // General (All) category option
  const allItem = document.createElement('li');
  allItem.className = `category-item${state.selectedSidebarCategory === 'all' ? ' active' : ''}`;
  allItem.innerHTML = `
    <div class="category-item-meta">
      <span class="category-dot" style="background-color: var(--primary);"></span>
      <span>All Categories</span>
    </div>
    <span class="category-count">${state.tasks.length}</span>
  `;
  allItem.addEventListener('click', () => {
    state.selectedSidebarCategory = 'all';
    document.querySelectorAll('.category-item').forEach(e => e.classList.remove('active'));
    allItem.classList.add('active');
    renderTasks();
  });
  DOM.sidebarCategories.appendChild(allItem);

  // User Categories
  state.categories.forEach((cat, idx) => {
    const count = state.tasks.filter(t => t.category === cat.id).length;
    const li = document.createElement('li');
    li.className = `category-item${state.selectedSidebarCategory === cat.id ? ' active' : ''}`;
    li.draggable = true;

    li.innerHTML = `
      <div class="category-item-meta">
        <span class="category-drag-handle" aria-hidden="true"><i class="ri-drag-move-2-line"></i></span>
        <span class="category-dot category-dot-btn" style="background-color: ${cat.color};" title="Change colour" role="button" tabindex="0" aria-label="Change category colour"></span>
        <span class="category-name-text">${escapeHTML(cat.name)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="category-count">${count}</span>
        <button type="button" class="category-rename-btn" title="Rename Category" aria-label="Rename category">
          <i class="ri-pencil-line"></i>
        </button>
        <button type="button" class="category-delete-btn" title="Delete Category" aria-label="Delete category">
          <i class="ri-delete-bin-5-line"></i>
        </button>
      </div>
    `;

    // Drag-to-reorder events
    li.addEventListener('dragstart', (e) => {
      dragSrcCatIndex = idx;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => li.classList.add('cat-dragging'), 0);
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('cat-dragging');
      document.querySelectorAll('.category-item').forEach(el => el.classList.remove('cat-drag-over'));
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.category-item[draggable]').forEach(el => el.classList.remove('cat-drag-over'));
      if (dragSrcCatIndex !== idx) li.classList.add('cat-drag-over');
    });
    li.addEventListener('dragleave', () => li.classList.remove('cat-drag-over'));
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.classList.remove('cat-drag-over');
      if (dragSrcCatIndex === null || dragSrcCatIndex === idx) return;
      const cats = [...state.categories];
      const [moved] = cats.splice(dragSrcCatIndex, 1);
      cats.splice(idx, 0, moved);
      cats.forEach((c, i) => { c.order = i; });
      state.categories = cats;
      dragSrcCatIndex = null;
      persistCategoriesReorder(cats);
      renderCategories();
    });

    li.querySelector('.category-dot-btn').addEventListener('click', (e) => {
      openCategoryColorPicker(e, cat.id, cat.color);
    });

    li.addEventListener('click', (e) => {
      if (e.target.closest('.category-delete-btn')) return;
      if (e.target.closest('.category-rename-btn')) return;
      if (e.target.closest('.category-drag-handle')) return;
      if (e.target.closest('.category-dot-btn')) return;

      state.selectedSidebarCategory = cat.id;
      document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      renderTasks();
    });

    li.querySelector('.category-rename-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startRenameCategory(li, cat.id, cat.name);
    });

    li.querySelector('.category-delete-btn').addEventListener('click', () => {
      deleteCategory(cat.id);
    });

    DOM.sidebarCategories.appendChild(li);
  });

  // 2. Options in task form category dropdown
  DOM.taskFormCategory.innerHTML = '';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    DOM.taskFormCategory.appendChild(opt);
  });
  
  // Custom fallback General option just in case
  const generalOpt = document.createElement('option');
  generalOpt.value = '';
  generalOpt.textContent = 'General';
  DOM.taskFormCategory.appendChild(generalOpt);

  // 3. Update top filter options
  DOM.taskFilterCategory.innerHTML = '<option value="all">All Categories</option>';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    if (state.filterCategory === cat.id) opt.selected = true;
    DOM.taskFilterCategory.appendChild(opt);
  });

  // 4. Mobile category chip row (mirrors the dropdown).
  renderCategoryChips();
}

function openCategoryColorPicker(e, catId, currentColor) {
  e.stopPropagation();
  document.querySelector('.cat-color-popover')?.remove();

  const popover = document.createElement('div');
  popover.className = 'cat-color-popover';
  popover.innerHTML = PRESET_COLORS.map(c => `
    <button type="button" class="cat-color-opt${c === currentColor ? ' selected' : ''}"
      style="background:${c}" data-color="${c}" title="${c}" aria-label="Set category color to ${c}"></button>
  `).join('');

  const rect = e.target.getBoundingClientRect();
  popover.style.top  = `${rect.bottom + 6 + window.scrollY}px`;
  popover.style.left = `${rect.left + window.scrollX}px`;
  document.body.appendChild(popover);

  popover.querySelectorAll('.cat-color-opt').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      state.categories = state.categories.map(c =>
        c.id === catId ? { ...c, color: btn.dataset.color } : c
      );
      persistCategoryUpdate(state.categories.find(c => c.id === catId));
      renderCategories();
      renderTasks();
      popover.remove();
    });
  });

  const closeHandler = (ev) => {
    if (!popover.contains(ev.target)) {
      popover.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

function renameCategory(id, newName) {
  state.categories = state.categories.map(c => c.id === id ? { ...c, name: newName } : c);
  persistCategoryUpdate(state.categories.find(c => c.id === id));
  renderCategories();
  renderTasks();
}

function startRenameCategory(li, catId, currentName) {
  const nameSpan = li.querySelector('.category-name-text');
  if (!nameSpan) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.className = 'category-rename-input';
  input.maxLength = 15;
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  let done = false;

  function commit() {
    if (done) return;
    done = true;
    const newName = input.value.trim();
    if (!newName || newName === currentName) { renderCategories(); return; }
    const duplicate = state.categories.some(c => c.id !== catId && c.name.toLowerCase() === newName.toLowerCase());
    if (duplicate) { alert('A category with this name already exists.'); renderCategories(); return; }
    renameCategory(catId, newName);
  }

  function cancel() {
    if (done) return;
    done = true;
    renderCategories();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });
}

function getFilteredTasks() {
  return state.tasks.filter(t => {
    // 1. Sidebar category filter
    const matchesSidebar = state.selectedSidebarCategory === 'all' || t.category === state.selectedSidebarCategory;
    
    // 2. Dropdown category filter
    const matchesDropdown = state.filterCategory === 'all' || t.category === state.filterCategory;
    
    // 3. Search query filter (matches title or description)
    const query = state.searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query));

    // Settings: optionally hide completed tasks
    const matchesCompleted = state.settings.showCompleted || t.status !== 'done';

    return matchesSidebar && matchesDropdown && matchesSearch && matchesCompleted;
  });
}

function renderTasks() {
  const filtered = getFilteredTasks();
  
  if (state.activeView === 'board') {
    // Clear all matrix cells
    const cells = document.querySelectorAll('.matrix-cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
    });
    
    // Sort filtered tasks by order
    const sortedFiltered = [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Counters
    let colCounts = { todo: 0, 'in-progress': 0, done: 0 };
    let rowCounts = { high: 0, medium: 0, low: 0 };

    sortedFiltered.forEach(t => {
      if (colCounts[t.status] !== undefined) colCounts[t.status]++;
      if (rowCounts[t.priority] !== undefined) rowCounts[t.priority]++;
      
      const cell = document.querySelector(`.matrix-cell[data-status="${t.status}"][data-priority="${t.priority}"]`);
      if (cell) {
        cell.appendChild(createTaskCard(t));
      }
    });
    
    // Update column counters (desktop matrix headers)
    DOM.todoCount.textContent = colCounts.todo;
    DOM.progressCount.textContent = colCounts['in-progress'];
    DOM.doneCount.textContent = colCounts.done;
    
    // Update priority row counters
    const highCount = document.getElementById('high-count');
    const mediumCount = document.getElementById('medium-count');
    const lowCount = document.getElementById('low-count');
    if (highCount) highCount.textContent = rowCounts.high;
    if (mediumCount) mediumCount.textContent = rowCounts.medium;
    if (lowCount) lowCount.textContent = rowCounts.low;

    // Attach quick-add trigger to each matrix cell
    document.querySelectorAll('.matrix-cell').forEach(cell => {
      attachQuickAddToCell(cell);
    });

  } else {
    // LIST VIEW
    DOM.workspaceList.innerHTML = '';
    
    if (filtered.length === 0) {
      renderEmptyState(DOM.workspaceList, 'No matching tasks found.');
    } else {
      // Sort tasks: Active status first, then by priority, then by due date
      const sorted = [...filtered].sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        
        // Priority ranking
        const prioVal = { high: 3, medium: 2, low: 1 };
        const diffPrio = prioVal[b.priority] - prioVal[a.priority];
        if (diffPrio !== 0) return diffPrio;
        
        // Due Date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      
      sorted.forEach(t => {
        DOM.workspaceList.appendChild(createTaskCard(t, true));
      });
    }
  }

  // Mobile board = 3x3 count grid; refresh the drill-in if it's open.
  renderMobileGrid();
  if (drillCell) renderDrillList();

  setupDragAndDrop();
}

function attachQuickAddToCell(cell) {
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'quick-add-trigger';
  trigger.innerHTML = '<i class="ri-add-line"></i><span>Add task</span>';
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    showQuickAddForm(cell);
  });
  cell.appendChild(trigger);
}

function showQuickAddForm(cell) {
  const trigger = cell.querySelector('.quick-add-trigger');
  if (trigger) trigger.remove();

  // Default to the active sidebar category if one is selected
  const defaultCatId = state.selectedSidebarCategory !== 'all' && state.categories.some(c => c.id === state.selectedSidebarCategory)
    ? state.selectedSidebarCategory
    : (state.categories.length > 0 ? state.categories[0].id : 'general');

  const categoryOptions = state.categories.map(c =>
    `<option value="${c.id}"${c.id === defaultCatId ? ' selected' : ''}>${escapeHTML(c.name)}</option>`
  ).join('');

  const form = document.createElement('div');
  form.className = 'quick-add-form';
  form.innerHTML = `
    <input type="text" class="quick-add-input" placeholder="Task name…" maxlength="100" autocomplete="off">
    <select class="quick-add-category">${categoryOptions}</select>
    <div class="quick-add-actions">
      <button type="button" class="quick-add-save">Add</button>
      <button type="button" class="quick-add-cancel"><i class="ri-close-line"></i></button>
    </div>
  `;
  cell.appendChild(form);

  const input    = form.querySelector('.quick-add-input');
  const catSelect = form.querySelector('.quick-add-category');
  input.focus();

  let done = false;

  function commit() {
    if (done) return;
    done = true;
    const title = input.value.trim();
    if (title) {
      const priority = cell.dataset.priority;
      const status   = cell.dataset.status;
      const newTask = {
        id: genId(),
        title,
        description: '',
        category: catSelect.value || null,
        priority,
        status,
        dueDate: '',
        subtasks: [],
        order: getNextOrderValue(status, priority)
      };
      state.tasks.push(newTask);
      persistTaskUpsert(newTask);
      updateStats();
    }
    renderTasks();
  }

  function cancel() {
    if (done) return;
    done = true;
    renderTasks();
  }

  form.querySelector('.quick-add-save').addEventListener('click', commit);
  form.querySelector('.quick-add-cancel').addEventListener('click', cancel);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });
  catSelect.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });

  // Cancel only when focus leaves the entire form (not just the input)
  form.addEventListener('focusout', (e) => {
    if (!form.contains(e.relatedTarget)) setTimeout(cancel, 150);
  });
}

function renderEmptyState(container, text) {
  container.innerHTML = `
    <div class="empty-state">
      <i class="ri-checkbox-multiple-line"></i>
      <h3>Empty Status</h3>
      <p>${text}</p>
    </div>
  `;
}

function createTaskCard(task, isListView = false) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.id = `card-${task.id}`;
  card.dataset.id = task.id;
  card.dataset.priority = task.priority;
  card.draggable = true;

  // Retrieve category colors & names
  const categoryObj = state.categories.find(c => c.id === task.category) || { name: 'General', color: '#64748b' };

  // Apply category color tint via CSS custom property
  const hex = categoryObj.color.replace('#', '');
  const cr = parseInt(hex.slice(0, 2), 16);
  const cg = parseInt(hex.slice(2, 4), 16);
  const cb = parseInt(hex.slice(4, 6), 16);
  card.style.setProperty('--cat-rgb', `${cr}, ${cg}, ${cb}`);
  
  // Format due date
  let dueDateText = 'No due date';
  let isOverdue = false;
  
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(task.dueDate + 'T00:00:00'); // set local midnight
    
    // Formatting helper — honor the date-format setting (MM/DD vs DD/MM)
    const pad = n => String(n).padStart(2, '0');
    const mm = pad(due.getMonth() + 1), dd = pad(due.getDate());
    dueDateText = state.settings.dateFormat === 'ddmm' ? `${dd}/${mm}` : `${mm}/${dd}`;

    if (due < today && task.status !== 'done') {
      isOverdue = true;
      dueDateText = `Overdue: ${dueDateText}`;
    } else if (due.getTime() === today.getTime()) {
      dueDateText = `Today`;
    }
  }

  // Calculate Subtask values
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Build card markup
  card.innerHTML = `
    <div class="card-header">
      <div class="card-tags">
        <span class="tag-badge" style="background-color: ${categoryObj.color}22; color: ${categoryObj.color}; border: 1px solid ${categoryObj.color}44;">
          ${escapeHTML(categoryObj.name)}
        </span>
        <span class="priority-badge priority-${task.priority}">
          ${task.priority}
        </span>
      </div>
      <div class="card-actions">
        <button type="button" class="card-btn edit-task-btn" title="Edit details">
          <i class="ri-edit-2-line"></i>
        </button>
        <button type="button" class="card-btn delete delete-task-btn" title="Delete task">
          <i class="ri-delete-bin-6-line"></i>
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <h4 class="card-title ${task.status === 'done' ? 'status-done-title' : ''}">${escapeHTML(task.title)}</h4>
      ${task.description ? `<p class="card-desc">${escapeHTML(task.description)}</p>` : ''}
    </div>

    <!-- Subtasks Panel -->
    ${totalSubtasks > 0 ? `
      <div class="card-subtasks">
        <div class="subtasks-header" data-expanded="false">
          <span>Subtasks: ${completedSubtasks}/${totalSubtasks}</span>
          <i class="ri-arrow-down-s-line"></i>
        </div>
        <div class="subtasks-progress-bar">
          <div class="subtasks-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <ul class="card-subtask-list" style="display: none;">
          ${task.subtasks.map(sub => `
            <li class="subtask-item">
              <label class="checkbox-container">
                <input type="checkbox" data-task-id="${task.id}" data-sub-id="${sub.id}" ${sub.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
              </label>
              <span class="${sub.completed ? 'subtask-text-checked' : ''}">${escapeHTML(sub.text)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="card-footer">
      <span class="card-due ${isOverdue ? 'overdue' : ''}">
        <i class="ri-calendar-event-line"></i>
        <span>${dueDateText}</span>
      </span>
      
      <!-- List View status button quick togglers -->
      ${isListView ? `
        <div class="view-toggle-group" style="padding: 2px; border-radius: 4px;">
          <button type="button" class="view-btn quick-status-btn" data-status="todo" ${task.status === 'todo' ? 'style="color: var(--primary); font-weight:bold"' : ''} title="To Do">T</button>
          <button type="button" class="view-btn quick-status-btn" data-status="in-progress" ${task.status === 'in-progress' ? 'style="color: var(--accent-cyan); font-weight:bold"' : ''} title="In Progress">P</button>
          <button type="button" class="view-btn quick-status-btn" data-status="done" ${task.status === 'done' ? 'style="color: var(--priority-low-hue); font-weight:bold"' : ''} title="Done">D</button>
        </div>
      ` : `
        <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">
          ${task.status.replace('-', ' ')}
        </span>
      `}
    </div>
  `;

  // Bind edit/delete handlers
  card.querySelector('.edit-task-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openTaskModal(task.id);
  });
  card.querySelector('.delete-task-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  // Expandable subtasks checklist click drawer
  if (totalSubtasks > 0) {
    const subHeader = card.querySelector('.subtasks-header');
    const subList = card.querySelector('.card-subtask-list');
    const arrow = subHeader.querySelector('i');
    
    subHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = subHeader.dataset.expanded === 'true';
      subHeader.dataset.expanded = !isExpanded;
      subList.style.display = isExpanded ? 'none' : 'flex';
      arrow.className = isExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line';
    });

    // Checkbox togglers
    card.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const tId = e.target.dataset.taskId;
        const sId = e.target.dataset.subId;
        toggleSubtaskState(tId, sId, e.target.checked);
      });
    });
  }

  // Quick status switches for list view row
  if (isListView) {
    card.querySelectorAll('.quick-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stat = btn.dataset.status;
        changeTaskStatus(task.id, stat);
      });
    });
  }

  return card;
}

function updateStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'done').length;
  const active = state.tasks.filter(t => t.status === 'in-progress').length;
  
  // Calculate overdues
  const today = new Date();
  today.setHours(0,0,0,0);
  const overdueCount = state.tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false;
    const due = new Date(t.dueDate + 'T00:00:00');
    return due < today;
  }).length;

  // Percentage loader
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Radial SVG offsets (Circumference = 2 * pi * r (r=20) = 125.66)
  const strokeDashoffset = total > 0 ? 125.66 - (125.66 * percentage) / 100 : 125.66;
  DOM.progressCircle.style.strokeDashoffset = strokeDashoffset;
  DOM.progressPercentageLabel.textContent = `${percentage}%`;
  
  DOM.statsCompletionFraction.textContent = `${completed}/${total}`;
  DOM.statsActiveCount.textContent = active;
  DOM.statsOverdueCount.textContent = overdueCount;

  // Refresh counts on the sidebar navigation counts
  renderCategories();
}

// --- HTML Modal Triggers ---
function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
  // Flush temporary subtasks state
  state.tempSubtasks = [];
}

function openTaskModal(taskId = null) {
  if (taskId) {
    // EDIT MODE
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    DOM.taskModalTitle.textContent = 'Edit Task';
    DOM.taskFormId.value = task.id;
    DOM.taskFormTitle.value = task.title;
    DOM.taskFormDesc.value = task.description || '';
    DOM.taskFormCategory.value = task.category;
    DOM.taskFormPriority.value = task.priority;
    DOM.taskFormDueDate.value = task.dueDate || '';
    DOM.taskFormStatus.value = task.status;
    
    // Copy subtasks into editor workspace temp memory
    state.tempSubtasks = task.subtasks ? [...task.subtasks] : [];
  } else {
    // CREATE MODE
    DOM.taskModalTitle.textContent = 'Create Task';
    DOM.taskFormId.value = '';
    DOM.taskForm.reset();
    
    // Set default due date to today
    DOM.taskFormDueDate.value = new Date().toISOString().split('T')[0];
    DOM.taskFormStatus.value = 'todo';
    DOM.taskFormPriority.value = state.settings.defaultPriority || 'medium';
    DOM.taskFormCategory.value = state.categories.length > 0 ? state.categories[0].id : '';
    
    state.tempSubtasks = [];
  }
  
  renderModalSubtasks();
  openModal(DOM.taskModal);
}

// --- HTML5 Drag and Drop Handlers ---
let dragSourceCard = null;

function setupDragAndDrop() {
  if (state.activeView !== 'board') return;

  const cards = document.querySelectorAll('.task-card');
  const cells = document.querySelectorAll('.matrix-cell');

  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  cells.forEach(cell => {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('dragenter', handleDragEnter);
    cell.addEventListener('dragleave', handleDragLeave);
    cell.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  dragSourceCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  removeDropIndicators();
  dragSourceCard = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const container = this;
  const afterElement = getDragAfterElement(container, e.clientY);
  
  removeDropIndicators();

  if (afterElement == null) {
    const indicator = createDropIndicator();
    container.appendChild(indicator);
  } else {
    const indicator = createDropIndicator();
    container.insertBefore(indicator, afterElement);
  }
}

function handleDragEnter() {
  this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  const taskId = e.dataTransfer.getData('text/plain');
  const targetStatus = this.dataset.status;
  const targetPriority = this.dataset.priority;
  
  const container = this;
  const afterElement = getDragAfterElement(container, e.clientY);
  
  removeDropIndicators();

  // Find target card index / order positioning within this priority status cell
  let newOrder = 0;
  const cellTasks = state.tasks
    .filter(t => t.status === targetStatus && t.priority === targetPriority && t.id !== taskId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (afterElement == null) {
    newOrder = cellTasks.length > 0 ? cellTasks[cellTasks.length - 1].order + 1 : 0;
  } else {
    const afterId = afterElement.dataset.id;
    const targetIdx = cellTasks.findIndex(t => t.id === afterId);
    newOrder = targetIdx > 0 ? (cellTasks[targetIdx].order + cellTasks[targetIdx - 1].order) / 2 : cellTasks[targetIdx].order - 0.5;
  }

  // Update status, priority, and order in state
  state.tasks = state.tasks.map(t => {
    if (t.id === taskId) {
      return { ...t, status: targetStatus, priority: targetPriority, order: newOrder };
    }
    return t;
  });

  // Re-normalize order numbers (0, 1, 2...)
  normalizeOrderNumbers();

  // Drag can renumber many cells; persist all tasks to keep order in sync.
  persistTasksBulk(state.tasks);
  renderTasks();
  updateStats();
}

function createDropIndicator() {
  const ind = document.createElement('div');
  ind.className = 'drop-indicator';
  return ind;
}

function removeDropIndicators() {
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}

function normalizeOrderNumbers() {
  ['todo', 'in-progress', 'done'].forEach(status => {
    ['high', 'medium', 'low'].forEach(priority => {
      const list = state.tasks
        .filter(t => t.status === status && t.priority === priority)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      list.forEach((t, index) => {
        t.order = index;
      });
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Navigation Sidebar Item toggling
  DOM.navBoardView.addEventListener('click', () => setView('board'));
  DOM.navListView.addEventListener('click', () => setView('list'));

  // Header quick toggles
  DOM.viewBoardBtn.addEventListener('click', () => setView('board'));
  DOM.viewListBtn.addEventListener('click', () => setView('list'));

  // --- Mobile view wiring ---
  // Desktop/mobile preview toggle + react to real viewport changes.
  DOM.viewportToggleBtn.addEventListener('click', toggleViewport);
  MOBILE_MQ.addEventListener('change', applyViewport);

  // One-tap light/dark theme toggle (top bar, desktop + mobile).
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Profile menu (avatar) — Profile / Settings / Sign out. Outside-click closes.
  DOM.profileMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleProfileMenu(); });
  DOM.pmProfile.addEventListener('click', openProfileModal);
  DOM.pmSettings.addEventListener('click', openSettingsModal);
  DOM.accountPopoverSignout.addEventListener('click', () => { toggleProfileMenu(false); DB.Auth.signOut(); });
  document.addEventListener('click', (e) => {
    if (!DOM.profileMenu.hidden && !e.target.closest('.account-popover, #account-avatar-btn')) {
      toggleProfileMenu(false);
    }
  });

  // Profile modal
  DOM.profileCloseBtn.addEventListener('click', () => closeModal(DOM.profileModal));
  DOM.profileCancelBtn.addEventListener('click', () => closeModal(DOM.profileModal));
  DOM.profileSaveBtn.addEventListener('click', saveProfile);
  DOM.profileName.addEventListener('input', renderAvatarDots);
  DOM.profileColorDots.addEventListener('click', (e) => {
    const dot = e.target.closest('.cdot');
    if (dot) { tempAvatarColor = dot.dataset.color; renderAvatarDots(); }
  });

  // Settings modal
  DOM.settingsCloseBtn.addEventListener('click', () => closeModal(DOM.settingsModal));
  DOM.settingsDoneBtn.addEventListener('click', () => closeModal(DOM.settingsModal));
  DOM.settingsModal.addEventListener('click', handleSettingsClick);
  DOM.setDefaultPriority.addEventListener('change', () => { state.settings.defaultPriority = DOM.setDefaultPriority.value; saveProfileSettings(); });
  DOM.setImportFile.addEventListener('change', handleSettingsImport);

  // Category chip row (mobile quick category nav).
  DOM.categoryChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (chip) setCategoryFilter(chip.dataset.cat);
  });

  // Mobile matrix grid: tap a tile -> drill into that intersection.
  DOM.mobileGrid.addEventListener('click', (e) => {
    const tile = e.target.closest('.mg-tile');
    if (tile) openDrill(tile.dataset.priority, tile.dataset.status);
  });
  DOM.drillBack.addEventListener('click', closeDrill);

  // Title-first quick-add sheet.
  DOM.qaScrim.addEventListener('click', closeQuickAdd);
  DOM.qaSave.addEventListener('click', saveQuickAdd);
  DOM.qaMore.addEventListener('click', quickAddMore);
  DOM.qaTitle.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveQuickAdd(); } });

  // Bottom nav primary actions (Add opens the quick-add sheet).
  DOM.bottomNavBoard.addEventListener('click', () => setView('board'));
  DOM.bottomNavList.addEventListener('click', () => setView('list'));
  DOM.bottomNavAdd.addEventListener('click', () => openQuickAdd());

  // Search input actions
  DOM.taskSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTasks();
  });

  // Top category filter dropdown (kept in sync with the mobile chip row)
  DOM.taskFilterCategory.addEventListener('change', (e) => {
    setCategoryFilter(e.target.value);
  });

  // Dialog overlays close buttons
  DOM.openTaskModalBtn.addEventListener('click', () => openTaskModal());
  DOM.closeTaskModalBtn.addEventListener('click', () => closeModal(DOM.taskModal));
  DOM.cancelTaskFormBtn.addEventListener('click', () => closeModal(DOM.taskModal));
  
  DOM.openCategoryModalBtn.addEventListener('click', () => {
    DOM.categoryForm.reset();
    setupPresetColorsPicker();
    openModal(DOM.categoryModal);
  });
  DOM.closeCategoryModalBtn.addEventListener('click', () => closeModal(DOM.categoryModal));
  DOM.cancelCategoryFormBtn.addEventListener('click', () => closeModal(DOM.categoryModal));

  // Modal overlay click targets to dismiss
  [DOM.taskModal, DOM.categoryModal].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  // Subtask Form list mutations
  DOM.subtaskAddBtn.addEventListener('click', () => {
    addTempSubtask(DOM.subtaskAddInput.value);
  });
  DOM.subtaskAddInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTempSubtask(DOM.subtaskAddInput.value);
    }
  });

  // Task form submission
  DOM.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskData = {
      title: DOM.taskFormTitle.value.trim(),
      description: DOM.taskFormDesc.value.trim(),
      category: DOM.taskFormCategory.value,
      priority: DOM.taskFormPriority.value,
      dueDate: DOM.taskFormDueDate.value,
      status: DOM.taskFormStatus.value,
      subtasks: [...state.tempSubtasks]
    };
    createOrUpdateTask(taskData);
  });

  // Category form submission
  DOM.categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const catName = DOM.categoryFormName.value.trim();
    const catColor = DOM.categoryFormColor.value;
    
    // Check if category name already exists
    const duplicate = state.categories.some(c => c.name.toLowerCase() === catName.toLowerCase());
    if (duplicate) {
      alert('A category with this name already exists.');
      return;
    }

    createCategory(catName, catColor);
    closeModal(DOM.categoryModal);
  });
}

// --- Auth UI listeners (cloud) ----------------------------------------------
function setupAuthListeners() {
  if (!DOM.authForm) return;

  // Google OAuth
  DOM.authGoogleBtn.addEventListener('click', async () => {
    setAuthMessage('');
    const { error } = await DB.Auth.signInWithGoogle();
    if (error) setAuthMessage(error.message);
  });

  // Toggle between sign-in and sign-up
  DOM.authToggleBtn.addEventListener('click', () => {
    authMode = authMode === 'signin' ? 'signup' : 'signin';
    const signup = authMode === 'signup';
    DOM.authSubmitBtn.textContent = signup ? 'Create Account' : 'Sign In';
    DOM.authToggleText.textContent = signup ? 'Already have an account?' : 'New here?';
    DOM.authToggleBtn.textContent = signup ? 'Sign in instead' : 'Create an account';
    DOM.authPassword.autocomplete = signup ? 'new-password' : 'current-password';
    setAuthMessage('');
  });

  // Email / password submit
  DOM.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = DOM.authEmail.value.trim();
    const password = DOM.authPassword.value;
    setAuthMessage('');
    DOM.authSubmitBtn.disabled = true;

    try {
      if (authMode === 'signup') {
        const { data, error } = await DB.Auth.signUp(email, password);
        if (error) { setAuthMessage(error.message); }
        else if (data.user && !data.session) {
          setAuthMessage('Check your email to confirm your account, then sign in.', true);
        }
      } else {
        const { error } = await DB.Auth.signInWithPassword(email, password);
        if (error) setAuthMessage(error.message);
      }
    } catch (err) {
      setAuthMessage(err.message || 'Something went wrong.');
    } finally {
      DOM.authSubmitBtn.disabled = false;
    }
  });

  // Sign out
  DOM.signoutBtn.addEventListener('click', async () => {
    await DB.Auth.signOut();
  });
}

function setAuthMessage(text, success = false) {
  DOM.authMessage.textContent = text;
  DOM.authMessage.classList.toggle('success', success);
}

// --- Utility Helpers ---
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Run application!
document.addEventListener('DOMContentLoaded', boot);
// Run immediately if DOMContentLoaded has already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  boot();
}
