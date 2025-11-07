/**
 * Session Manager
 * Handles session metadata storage, validation, and lifecycle management
 */

import { SESSION_CONFIG } from '@/config/sessionConfig';

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

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
  // Validate UUID before storing
  if (!isValidUUID(userId)) {
    console.error('[SessionManager] Invalid user ID (not a UUID):', userId);
    throw new Error('Invalid user ID format');
  }
  
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
  // Validate UUID before reading
  if (!isValidUUID(userId)) {
    console.warn('[SessionManager] Invalid user ID detected (not a UUID):', userId);
    clearInvalidSessions();
    return null;
  }
  
  try {
    const data = localStorage.getItem(`${SESSION_METADATA_KEY}_${userId}`);
    if (!data) return null;
    
    const metadata: SessionMetadata = JSON.parse(data);
    
    // Double-check the stored userId is also valid
    if (!isValidUUID(metadata.userId)) {
      console.warn('[SessionManager] Stored session has invalid UUID, clearing');
      clearSessionMetadata(userId);
      return null;
    }
    
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

/**
 * Clear sessions with invalid UUIDs
 */
export function clearInvalidSessions(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(SESSION_METADATA_KEY)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const metadata = JSON.parse(data);
            if (!isValidUUID(metadata.userId)) {
              console.warn('[SessionManager] Removing invalid session:', key);
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.warn('[SessionManager] Removing corrupted session:', key);
          localStorage.removeItem(key);
        }
      }
    });
    
    // Also clear any mock auth tokens
    const loopllyUser = localStorage.getItem('looplly_user');
    if (loopllyUser) {
      try {
        const user = JSON.parse(loopllyUser);
        if (user.id && !isValidUUID(user.id)) {
          console.warn('[SessionManager] Clearing looplly_user with invalid UUID');
          localStorage.removeItem('looplly_user');
          localStorage.removeItem('looplly_auth_token');
        }
      } catch (e) {
        // Invalid JSON, clear it
        localStorage.removeItem('looplly_user');
        localStorage.removeItem('looplly_auth_token');
      }
    }
    
    const simulatorUser = sessionStorage.getItem('simulator_user');
    if (simulatorUser) {
      try {
        const user = JSON.parse(simulatorUser);
        if (user.id && !isValidUUID(user.id)) {
          console.warn('[SessionManager] Clearing simulator_user with invalid UUID');
          sessionStorage.removeItem('simulator_user');
          sessionStorage.removeItem('simulator_auth_token');
        }
      } catch (e) {
        sessionStorage.removeItem('simulator_user');
        sessionStorage.removeItem('simulator_auth_token');
      }
    }
  } catch (error) {
    console.error('[SessionManager] Error clearing invalid sessions:', error);
  }
}
