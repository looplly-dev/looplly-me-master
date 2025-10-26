import { supabase } from './client';
import { simulatorClient } from './simulatorClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Path-aware Supabase client selector
 * Returns simulatorClient for /simulator routes, main client otherwise
 * This ensures complete session isolation between simulator and admin/user portals
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    return supabase;
  }

  const pathname = window.location.pathname;
  const isSimulator = pathname.startsWith('/simulator');
  
  if (isSimulator) {
    console.info('[activeClient] Using simulator client for:', pathname);
    return simulatorClient;
  }
  
  return supabase;
}

// Convenience export for typical usage
export const activeClient = getSupabaseClient();

// Re-export for when you need to call getSupabaseClient() dynamically
export { supabase, simulatorClient };
