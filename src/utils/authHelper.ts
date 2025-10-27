import { supabase } from '@/integrations/supabase/client';

/**
 * Unified user ID retrieval for all auth types
 * Works for: Looplly JWT, Simulator JWT, Supabase Auth (team members)
 * 
 * Priority order:
 * 1. Simulator (sessionStorage) - highest priority in simulator context
 * 2. Looplly custom JWT (localStorage) - production users
 * 3. Supabase Auth - team members / admin users
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  // Priority 1: Simulator (sessionStorage)
  if (window.location.pathname.startsWith('/simulator')) {
    const simulatorUser = sessionStorage.getItem('simulator_user');
    if (simulatorUser) {
      try {
        const user = JSON.parse(simulatorUser);
        return user.user_id || user.id;
      } catch (error) {
        console.error('[authHelper] Failed to parse simulator_user:', error);
      }
    }
  }
  
  // Priority 2: Looplly custom JWT (localStorage)
  const loopllyUser = localStorage.getItem('looplly_user');
  if (loopllyUser) {
    try {
      const user = JSON.parse(loopllyUser);
      return user.id;
    } catch (error) {
      console.error('[authHelper] Failed to parse looplly_user:', error);
    }
  }
  
  // Priority 3: Supabase Auth (team members)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('[authHelper] Failed to get Supabase Auth user:', error);
    return null;
  }
};

/**
 * Get current user's mobile number (for OTP verification display)
 */
export const getCurrentUserMobile = async (): Promise<string | null> => {
  // Simulator
  if (window.location.pathname.startsWith('/simulator')) {
    const simulatorUser = sessionStorage.getItem('simulator_user');
    if (simulatorUser) {
      try {
        const user = JSON.parse(simulatorUser);
        return user.mobile || null;
      } catch (error) {
        console.error('[authHelper] Failed to parse simulator mobile:', error);
      }
    }
  }
  
  // Looplly JWT
  const loopllyUser = localStorage.getItem('looplly_user');
  if (loopllyUser) {
    try {
      const user = JSON.parse(loopllyUser);
      // If mobile not in snapshot, fetch from DB
      if (!user.mobile) {
        const userId = user.id;
        const { data } = await supabase
          .from('profiles')
          .select('mobile')
          .eq('user_id', userId)
          .single();
        return data?.mobile || null;
      }
      return user.mobile;
    } catch (error) {
      console.error('[authHelper] Failed to get Looplly mobile:', error);
    }
  }
  
  // Team members (fetch from profiles)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('mobile')
        .eq('user_id', user.id)
        .single();
      return data?.mobile || null;
    }
  } catch (error) {
    console.error('[authHelper] Failed to get team member mobile:', error);
  }
  
  return null;
};
