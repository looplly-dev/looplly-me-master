// This file uses hybrid environment configuration to work in all deployment scenarios
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { coreSupabaseConfig } from '@/config/hybridEnv';

// Use core config for immediate Supabase client creation
const SUPABASE_URL = coreSupabaseConfig.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = coreSupabaseConfig.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
