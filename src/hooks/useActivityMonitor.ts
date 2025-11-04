/**
 * Activity Monitor Hook
 * Tracks user activity and updates session metadata
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { updateLastActivity } from '@/utils/sessionManager';
import { SESSION_CONFIG } from '@/config/sessionConfig';

interface UseActivityMonitorOptions {
  userId: string | null;
  enabled?: boolean;
}

export function useActivityMonitor({ userId, enabled = true }: UseActivityMonitorOptions) {
  const location = useLocation();
  const lastUpdateRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const debouncedUpdate = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Only update if enough time has passed (debounce)
      if (timeSinceLastUpdate >= SESSION_CONFIG.ACTIVITY_UPDATE_DEBOUNCE_MS) {
        updateLastActivity(userId);
        lastUpdateRef.current = now;
      }
    };

    const handleActivity = () => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(debouncedUpdate, 1000);
    };

    // Track various user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial activity update on mount
    debouncedUpdate();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userId, enabled, location.pathname]);
}
