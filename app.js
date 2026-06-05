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
  theme: 'dark', // 'dark' | 'light' | 'system'
  tempSubtasks: [] // Array of subtasks for current modal workspace
};

// --- DOM Cache References ---
const DOM = {
  app: document.getElementById('app'),
  themeLightBtn: document.getElementById('theme-light-btn'),
  themeDarkBtn: document.getElementById('theme-dark-btn'),
  themeSystemBtn: document.getElementById('theme-system-btn'),
  
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
  signoutBtn: document.getElementById('signout-btn')
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
    DOM.accountEmail.textContent = email;
    DOM.accountAvatar.textContent = (email[0] || '?').toUpperCase();

    await loadCloudData();
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
  state.theme = savedTheme ? savedTheme : 'dark';
  state.activeView = savedView ? savedView : 'board';
}

async function loadCloudData() {
  // Theme/view stay per-device in localStorage.
  state.theme = localStorage.getItem('checkmate_theme') || 'dark';
  state.activeView = localStorage.getItem('checkmate_view') || 'board';
  applyTheme();

  try {
    let data = await DB.fetchAll();
    // One-time migration of this browser's localStorage tasks into the account.
    const migrated = await DB.migrateLocalStorageIfNeeded(data.categories);
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
  
  // Update theme button UI states
  DOM.themeLightBtn.classList.toggle('active', state.theme === 'light');
  DOM.themeDarkBtn.classList.toggle('active', state.theme === 'dark');
  DOM.themeSystemBtn.classList.toggle('active', state.theme === 'system');
}

// Handle system theme updates dynamically
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

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
  if (confirm('Are you sure you want to permanently delete this task?')) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    persistTaskDelete(id);
    renderTasks();
    updateStats();
  }
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
      
    return matchesSidebar && matchesDropdown && matchesSearch;
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
    
    // Update column counters
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
    
    // Formatting helper
    dueDateText = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
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
    DOM.taskFormPriority.value = 'medium';
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
  // Theme selection buttons
  DOM.themeLightBtn.addEventListener('click', () => { state.theme = 'light'; saveData(); applyTheme(); });
  DOM.themeDarkBtn.addEventListener('click', () => { state.theme = 'dark'; saveData(); applyTheme(); });
  DOM.themeSystemBtn.addEventListener('click', () => { state.theme = 'system'; saveData(); applyTheme(); });

  // Navigation Sidebar Item toggling
  DOM.navBoardView.addEventListener('click', () => setView('board'));
  DOM.navListView.addEventListener('click', () => setView('list'));

  // Header quick toggles
  DOM.viewBoardBtn.addEventListener('click', () => setView('board'));
  DOM.viewListBtn.addEventListener('click', () => setView('list'));

  // Search input actions
  DOM.taskSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTasks();
  });

  // Top category filter dropdown
  DOM.taskFilterCategory.addEventListener('change', (e) => {
    state.filterCategory = e.target.value;
    renderTasks();
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
