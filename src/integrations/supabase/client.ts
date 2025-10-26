import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use direct environment variables to avoid initialization issues
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Detect admin context for session isolation
const isAdmin = typeof window !== 'undefined' && 
                window.location && 
                window.location.pathname.startsWith('/admin');

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: isAdmin ? 'admin_auth' : 'auth', // Isolate admin sessions
    persistSession: true,
    autoRefreshToken: true,
  }
});
