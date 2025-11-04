import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use direct environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Admin-specific Supabase client with isolated session storage
 * This ensures admin sessions don't conflict with regular user or simulator sessions
 */
export const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: 'admin_auth', // Isolated from regular 'auth' bucket
    persistSession: true,
    autoRefreshToken: true,
  }
});
