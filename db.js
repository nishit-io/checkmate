// ============================================================================
//  Checkmate — data / auth / realtime layer (Supabase)
//
//  Everything that talks to Supabase lives here. app.js stays UI-only and
//  calls window.DB.* . This module maps between the database row shape
//  (snake_case) and the in-app object shape (camelCase) the UI already uses.
// ============================================================================

(function () {
  const cfg = window.CHECKMATE_CONFIG || {};
  const configured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes('YOUR_') &&
    !cfg.SUPABASE_ANON_KEY.includes('YOUR_');

  // `supabase` global comes from the CDN script in index.html
  const client = configured
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  let currentUser = null;
  let channel = null;

  // --- shape mapping --------------------------------------------------------

  function rowToTask(r) {
    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      category: r.category_id,          // may be null -> rendered as "General"
      priority: r.priority,
      status: r.status,
      dueDate: r.due_date || '',
      subtasks: Array.isArray(r.subtasks) ? r.subtasks : [],
      order: r.sort_order || 0
    };
  }

  function taskToRow(t) {
    return {
      id: t.id,
      user_id: currentUser.id,
      title: t.title,
      description: t.description || '',
      category_id: t.category || null,
      priority: t.priority,
      status: t.status,
      due_date: t.dueDate ? t.dueDate : null,
      subtasks: t.subtasks || [],
      sort_order: t.order || 0
    };
  }

  function rowToCat(r) {
    return { id: r.id, name: r.name, color: r.color, order: r.sort_order || 0 };
  }

  // --- auth -----------------------------------------------------------------

  const Auth = {
    isConfigured: () => configured,

    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      currentUser = data.session ? data.session.user : null;
      return data.session;
    },

    getUser: () => currentUser,

    onChange(cb) {
      if (!client) return;
      client.auth.onAuthStateChange((_event, session) => {
        currentUser = session ? session.user : null;
        cb(session);
      });
    },

    signInWithGoogle() {
      return client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
    },

    signInWithPassword(email, password) {
      return client.auth.signInWithPassword({ email, password });
    },

    signUp(email, password) {
      return client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
    },

    signOut() {
      return client.auth.signOut();
    }
  };

  // --- data: read ----------------------------------------------------------

  async function fetchAll() {
    const [cats, tasks] = await Promise.all([
      client.from('categories').select('*').order('sort_order', { ascending: true }),
      client.from('tasks').select('*').order('sort_order', { ascending: true })
    ]);
    if (cats.error) throw cats.error;
    if (tasks.error) throw tasks.error;
    return {
      categories: cats.data.map(rowToCat),
      tasks: tasks.data.map(rowToTask)
    };
  }

  // --- data: tasks ---------------------------------------------------------

  async function upsertTask(task) {
    const { error } = await client.from('tasks').upsert(taskToRow(task));
    if (error) throw error;
  }

  async function upsertTasks(tasks) {
    if (!tasks.length) return;
    const { error } = await client.from('tasks').upsert(tasks.map(taskToRow));
    if (error) throw error;
  }

  async function deleteTask(id) {
    const { error } = await client.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  // --- data: categories ----------------------------------------------------

  async function insertCategory(cat) {
    const { error } = await client.from('categories').insert({
      id: cat.id,
      user_id: currentUser.id,
      name: cat.name,
      color: cat.color,
      sort_order: cat.order || 0
    });
    if (error) throw error;
  }

  async function updateCategory(cat) {
    const { error } = await client
      .from('categories')
      .update({ name: cat.name, color: cat.color, sort_order: cat.order || 0 })
      .eq('id', cat.id);
    if (error) throw error;
  }

  async function deleteCategory(id) {
    // FK on tasks.category_id is ON DELETE SET NULL — tasks auto-detach.
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async function reorderCategories(cats) {
    // Persist new sort_order for each category after a drag-reorder.
    const rows = cats.map((c, i) => ({
      id: c.id,
      user_id: currentUser.id,
      name: c.name,
      color: c.color,
      sort_order: i
    }));
    const { error } = await client.from('categories').upsert(rows);
    if (error) throw error;
  }

  // --- realtime ------------------------------------------------------------

  function subscribe(onChange) {
    if (!client || !currentUser) return;
    if (channel) client.removeChannel(channel);

    const uid = currentUser.id;
    channel = client
      .channel('checkmate-' + uid)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${uid}` },
        onChange)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${uid}` },
        onChange)
      .subscribe();
  }

  function unsubscribe() {
    if (client && channel) {
      client.removeChannel(channel);
      channel = null;
    }
  }

  // --- one-time migration: localStorage -> DB ------------------------------
  //
  // Runs the first time a user logs in on a browser that still holds
  // localStorage tasks. Remaps the old string ids (cat-work, task-123) to the
  // fresh DB-generated category ids, then pushes everything up. Idempotent via
  // a per-user "migrated" flag in localStorage.

  // Core import: remap old string category ids to DB ids (matching seeded ones
  // by name, creating extras), then push tasks with fresh uuids. Shared by the
  // auto-migration and the manual importData() path.
  async function importPayload(localTasks, localCats, existingCategories) {
    const idMap = {};
    const byName = {};
    existingCategories.forEach(c => { byName[c.name.toLowerCase()] = c.id; });

    const catsToInsert = [];
    (localCats || []).forEach((lc, i) => {
      const match = byName[(lc.name || '').toLowerCase()];
      if (match) {
        idMap[lc.id] = match;
      } else {
        const newId = crypto.randomUUID();
        idMap[lc.id] = newId;
        byName[(lc.name || '').toLowerCase()] = newId;
        catsToInsert.push({ id: newId, name: lc.name, color: lc.color || '#6366f1', order: existingCategories.length + i });
      }
    });

    for (const c of catsToInsert) {
      await insertCategory(c);
    }

    const tasksToInsert = (localTasks || []).map(t => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description || '',
      category: idMap[t.category] || null,
      priority: t.priority || 'medium',
      status: t.status || 'todo',
      dueDate: t.dueDate || '',
      subtasks: t.subtasks || [],
      order: t.order || 0
    }));

    await upsertTasks(tasksToInsert);

    return { categories: catsToInsert.length, tasks: tasksToInsert.length };
  }

  async function migrateLocalStorageIfNeeded(existingCategories) {
    const flagKey = 'checkmate_migrated_' + currentUser.id;
    if (localStorage.getItem(flagKey)) return false;

    const rawTasks = localStorage.getItem('checkmate_tasks') || localStorage.getItem('apex_tasks');
    const rawCats  = localStorage.getItem('checkmate_categories') || localStorage.getItem('apex_categories');

    let localTasks = [];
    let localCats = [];
    try { localTasks = rawTasks ? JSON.parse(rawTasks) : []; } catch (_) {}
    try { localCats  = rawCats  ? JSON.parse(rawCats)  : []; } catch (_) {}

    if (!localTasks.length && !localCats.length) {
      localStorage.setItem(flagKey, '1');
      return false;
    }

    await importPayload(localTasks, localCats, existingCategories);
    localStorage.setItem(flagKey, '1');
    return true; // signal caller to re-fetch
  }

  // Manual import for data that lives on a DIFFERENT origin (e.g. your local
  // preview vs. the Vercel app). Paste {tasks, categories} exported from the old
  // origin. Run from the browser console while logged in:
  //   await DB.importData({ tasks: [...], categories: [...] })
  // then refresh.
  async function importData(payload) {
    if (!client || !currentUser) throw new Error('Not signed in.');
    payload = payload || {};
    const current = await fetchAll();
    const result = await importPayload(payload.tasks || [], payload.categories || [], current.categories);
    console.log(`Imported ${result.tasks} tasks and ${result.categories} new categories. Refresh to see them.`);
    return result;
  }

  // --- expose --------------------------------------------------------------

  window.DB = {
    Auth,
    fetchAll,
    upsertTask,
    upsertTasks,
    deleteTask,
    insertCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    subscribe,
    unsubscribe,
    migrateLocalStorageIfNeeded,
    importData
  };
})();
