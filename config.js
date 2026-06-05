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
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
};
