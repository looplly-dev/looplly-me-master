/**
 * Session Management Configuration
 * Defines timeout and validation intervals for secure session handling
 */

export const SESSION_CONFIG = {
  // Maximum session age (8 hours) - absolute timeout
  ADMIN_SESSION_TIMEOUT_MS: 8 * 60 * 60 * 1000,
  
  // Inactivity timeout (2 hours) - user must be active
  ADMIN_INACTIVITY_TIMEOUT_MS: 2 * 60 * 60 * 1000,
  
  // Regular user session timeout (24 hours)
  USER_SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000,
  
  // Regular user inactivity timeout (4 hours)
  USER_INACTIVITY_TIMEOUT_MS: 4 * 60 * 60 * 1000,
  
  // How often to check session validity (1 minute)
  SESSION_CHECK_INTERVAL_MS: 60 * 1000,
  
  // How often to update activity (debounce to 1 minute)
  ACTIVITY_UPDATE_DEBOUNCE_MS: 60 * 1000,
} as const;
