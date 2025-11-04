import { supabase } from './client';
import { simulatorClient } from './simulatorClient';
import { adminClient } from './adminClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Route-aware Supabase client selector
 * Returns the appropriate client based on the current pathname:
 * - /admin/* routes: adminClient (isolated admin_auth storage)
 * - /simulator/* routes: simulatorClient (sessionStorage)
 * - All other routes: supabase (regular auth storage)
 * 
 * This ensures complete session isolation between portals
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    return supabase;
  }

  const pathname = window.location.pathname;
  
  // Admin portal gets isolated admin client
  if (pathname.startsWith('/admin')) {
    if (import.meta.env.DEV) {
      console.info('[activeClient] Using admin client for:', pathname);
    }
    return adminClient;
  }
  
  // Simulator gets session-based client
  if (pathname.startsWith('/simulator')) {
    if (import.meta.env.DEV) {
      console.info('[activeClient] Using simulator client for:', pathname);
    }
    return simulatorClient;
  }
  
  // Regular users get standard client
  return supabase;
}

// Re-export for when you need specific clients
export { supabase, simulatorClient, adminClient };
