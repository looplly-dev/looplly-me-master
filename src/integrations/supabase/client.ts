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

// This client is dedicated to the User Portal only
// Admin Portal uses adminClient.ts with 'admin_auth' storage
// This ensures complete session isolation between portals

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: 'auth', // User Portal only - Admin uses 'admin_auth'
    persistSession: true,
    autoRefreshToken: true,
  }
});
