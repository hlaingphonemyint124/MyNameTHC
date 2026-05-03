// ─── Supabase Client ──────────────────────────────────────────────────────────
// 👇 STEP 1: Replace these with your Supabase project credentials
//    Find them at: https://supabase.com/dashboard → your project → Settings → API
//
//    VITE_SUPABASE_URL         = https://YOUR_PROJECT_ID.supabase.co
//    VITE_SUPABASE_ANON_KEY    = eyJhbGci... (the "anon / public" key)
//
//    Add both to your .env file, never hard-code secrets here.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Re-export types for convenience
export type { Database } from './types';
