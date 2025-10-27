import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';

export function useSecureSession() {
  const [isValidSession, setIsValidSession] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { authState } = useAuth();

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const CHECK_INTERVAL = 60 * 1000; // Check every minute

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setIsValidSession(false);
      return;
    }

    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsValidSession(false);
          return;
        }

        // Check if session is expired
        const now = Date.now();
        if (now - lastActivity > SESSION_TIMEOUT) {
          await supabase.auth.signOut();
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error('Session validation error:', error);
        setIsValidSession(false);
      }
    };

    // Initial check
    checkSession();

    // Set up periodic validation
    const interval = setInterval(checkSession, CHECK_INTERVAL);

    // Track user activity
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Listen for user activity
    document.addEventListener('mousedown', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('touchstart', updateActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('touchstart', updateActivity);
    };
  }, [authState.isAuthenticated, lastActivity]);

  const refreshSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        setIsValidSession(false);
      } else {
        setLastActivity(Date.now());
        setIsValidSession(true);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setIsValidSession(false);
    }
  };

  return {
    isValidSession,
    refreshSession,
    lastActivity,
  };
}