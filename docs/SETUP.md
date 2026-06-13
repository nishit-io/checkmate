# Checkmate — Cloud Setup Guide

The code is done. The app already runs locally on `localStorage` (no setup needed).
To turn on **cross-device sync + login**, do the account steps below. They are
the parts only you can do (they need your accounts and produce your keys).

Order: **Supabase → config.js → GitHub → Vercel → Google OAuth → redirect URLs**.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `checkmate`, set a strong database password (save it), pick a region near you.
3. Wait ~2 min for it to provision.

## 2. Run the schema

1. In the project: **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql), copy the whole file, paste, **Run**.
3. You should see "Success". This creates the `tasks` + `categories` tables,
   Row Level Security, the new-user default-category seeding, and realtime.

## 3. Get your keys → fill `config.js`

1. **Project Settings → API**.
2. Copy **Project URL** and the **anon / public** key.
3. Open [`config.js`](../config.js) and replace the placeholders:
   ```js
   window.CHECKMATE_CONFIG = {
     SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
     SUPABASE_ANON_KEY: 'eyJ...your-anon-key...'
   };
   ```
   > The anon key is **public by design** — safe to commit. RLS protects the data.
   > Never paste the `service_role` key here.

At this point you can open `index.html` locally and the login screen appears.
Email/password sign-up works immediately. Google needs steps 5–6.

## 4. Push to GitHub + deploy on Vercel

```powershell
# from the project folder
git add -A
git commit -m "Add Supabase cloud sync"
# create an empty repo on github.com first (e.g. "checkmate"), then:
git remote add origin https://github.com/nishit-io/checkmate.git
git push -u origin main
```

1. Go to <https://vercel.com> → **Add New → Project** → import the `checkmate` repo.
2. Framework preset: **Other**. Root directory: `./`. No build command. Output: `./`.
3. **Deploy**. Live deployment: <https://checkmate-eta-nine.vercel.app>

## 5. Enable Google sign-in

1. **Google Cloud Console** (<https://console.cloud.google.com>) → create/select a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name + your email → save.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Under **Authorized redirect URIs** add (from Supabase → Authentication → Providers → Google):
   ```
   https://cjblwyiayfuughypujla.supabase.co/auth/v1/callback
   ```
5. Copy the **Client ID** and **Client secret**.
6. In **Supabase → Authentication → Providers → Google**: enable it, paste Client ID + secret, save.

## 6. Tell Supabase your site URLs

**Supabase → Authentication → URL Configuration:**

- **Site URL:** `https://checkmate-eta-nine.vercel.app`
- **Redirect URLs:** add both:
  - `https://checkmate-eta-nine.vercel.app`
  - `http://localhost:8181` (or whatever local port you use)

Without this, Google login will bounce back to the wrong place.

---

## How it behaves

- **Not configured** (placeholders still in `config.js`): app runs on `localStorage`, no login. Lets you keep working before setup.
- **Configured:** login gate appears. After sign-in, tasks load from the cloud.
- **First login on a browser with old local tasks:** those tasks + categories are
  migrated into your account once (tracked by a `checkmate_migrated_<uid>` flag).
- **Realtime:** changes on one device appear on others within ~1s, no refresh.
- **Theme + board/list view** stay per-device (kept in `localStorage`).

## Security reminder

RLS is the **only** thing isolating users. It's enabled by the schema. To verify:
Supabase → **Authentication** → create a second test user → confirm they see an
empty board (only their own seeded categories), not your tasks.

## Free-tier note

Supabase free projects **pause after ~7 days of inactivity**. First load after a
pause is slow / may need a manual resume in the dashboard. Upgrade to remove this.
