/**
 * Session Manager
 * Handles session metadata storage, validation, and lifecycle management
 */

import { SESSION_CONFIG } from '@/config/sessionConfig';

export interface SessionMetadata {
  userId: string;
  createdAt: number;
  lastActivity: number;
  storageKey: string;
  userType: 'looplly_user' | 'looplly_team_user' | 'client_user';
}

const SESSION_METADATA_KEY = 'session_metadata';

/**
 * Store session metadata in localStorage
 */
export function storeSessionMetadata(
  userId: string, 
  storageKey: string,
  userType: 'looplly_user' | 'looplly_team_user' | 'client_user'
): void {
  const now = Date.now();
  const metadata: SessionMetadata = {
    userId,
    createdAt: now,
    lastActivity: now,
    storageKey,
    userType,
  };
  
  try {
    localStorage.setItem(`${SESSION_METADATA_KEY}_${userId}`, JSON.stringify(metadata));
    console.log('[SessionManager] Stored session metadata for user:', userId);
  } catch (error) {
    console.error('[SessionManager] Error storing session metadata:', error);
  }
}

/**
 * Get session metadata from localStorage
 */
export function getSessionMetadata(userId: string): SessionMetadata | null {
  try {
    const data = localStorage.getItem(`${SESSION_METADATA_KEY}_${userId}`);
    if (!data) return null;
    
    const metadata: SessionMetadata = JSON.parse(data);
    return metadata;
  } catch (error) {
    console.error('[SessionManager] Error reading session metadata:', error);
    return null;
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(userId: string): void {
  const metadata = getSessionMetadata(userId);
  if (!metadata) {
    console.warn('[SessionManager] No session metadata found for user:', userId);
    return;
  }
  
  metadata.lastActivity = Date.now();
  
  try {
    localStorage.setItem(`${SESSION_METADATA_KEY}_${userId}`, JSON.stringify(metadata));
  } catch (error) {
    console.error('[SessionManager] Error updating activity:', error);
  }
}

/**
 * Check if session is still valid based on age and inactivity
 */
export function checkSessionValidity(userId: string): {
  isValid: boolean;
  reason?: 'expired' | 'inactive' | 'missing';
} {
  const metadata = getSessionMetadata(userId);
  
  if (!metadata) {
    return { isValid: false, reason: 'missing' };
  }
  
  const now = Date.now();
  const age = now - metadata.createdAt;
  const inactivity = now - metadata.lastActivity;
  
  // Determine timeouts based on user type
  const sessionTimeout = metadata.userType === 'looplly_team_user' 
    ? SESSION_CONFIG.ADMIN_SESSION_TIMEOUT_MS 
    : SESSION_CONFIG.USER_SESSION_TIMEOUT_MS;
    
  const inactivityTimeout = metadata.userType === 'looplly_team_user'
    ? SESSION_CONFIG.ADMIN_INACTIVITY_TIMEOUT_MS
    : SESSION_CONFIG.USER_INACTIVITY_TIMEOUT_MS;
  
  // Session too old (absolute timeout)
  if (age > sessionTimeout) {
    console.warn('[SessionManager] Session expired due to age:', {
      userId,
      age: Math.round(age / 1000 / 60), // minutes
      maxAge: Math.round(sessionTimeout / 1000 / 60)
    });
    return { isValid: false, reason: 'expired' };
  }
  
  // Session inactive too long
  if (inactivity > inactivityTimeout) {
    console.warn('[SessionManager] Session expired due to inactivity:', {
      userId,
      inactivity: Math.round(inactivity / 1000 / 60), // minutes
      maxInactivity: Math.round(inactivityTimeout / 1000 / 60)
    });
    return { isValid: false, reason: 'inactive' };
  }
  
  return { isValid: true };
}

/**
 * Clear session metadata
 */
export function clearSessionMetadata(userId: string): void {
  try {
    localStorage.removeItem(`${SESSION_METADATA_KEY}_${userId}`);
    console.log('[SessionManager] Cleared session metadata for user:', userId);
  } catch (error) {
    console.error('[SessionManager] Error clearing session metadata:', error);
  }
}

/**
 * Clear all session metadata (for complete logout)
 */
export function clearAllSessionMetadata(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(SESSION_METADATA_KEY)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[SessionManager] Cleared all session metadata');
  } catch (error) {
    console.error('[SessionManager] Error clearing all session metadata:', error);
  }
}
