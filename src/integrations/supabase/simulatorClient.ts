import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use direct environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Simulator-specific client with isolated auth storage
// This prevents simulator sessions from interfering with admin/user sessions
export const simulatorClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage, // Ephemeral, iframe-only storage
    storageKey: 'simulator', // Separate key from default 'auth'
    persistSession: true,
    autoRefreshToken: false, // Disable auto-refresh to prevent auth loops
    detectSessionInUrl: false, // Don't parse URL for auth params
  },
  global: {
    headers: {
      'X-Simulator-Session': 'true', // Flag requests as simulator
    },
  },
});
