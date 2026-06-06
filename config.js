// ============================================================================
//  Checkmate — public client config
//
//  The anon key is SAFE to expose in frontend code. It is a *public* key.
//  Your data is protected by Row Level Security (see supabase/schema.sql),
//  NOT by hiding this key. Never put service_role or any secret key here.
//
//  Fill these in from: Supabase Dashboard → Project Settings → API
//    SUPABASE_URL       = "Project URL"
//    SUPABASE_ANON_KEY  = "Project API keys → anon / public"
// ============================================================================

window.CHECKMATE_CONFIG = {
  SUPABASE_URL: 'https://cjblwyiayfuughypujla.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYmx3eWlheWZ1dWdoeXB1amxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODgxMTEsImV4cCI6MjA5NjI2NDExMX0.eTXO--xwTaPrwqk70TmpRm3qYHXvBU--5zFamZPhURo'
};
