import { auditLogger } from './auditLogger';

export interface SecurityError extends Error {
  code?: string;
  isSecurityRelated?: boolean;
  internalMessage?: string;
}

class ErrorHandler {
  private sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /credential/i,
    /auth/i,
    /session/i,
  ];

  private isProduction = import.meta.env.NODE_ENV === 'production';

  public sanitizeError(error: any): { message: string; code?: string } {
    if (!error) {
      return { message: 'An unexpected error occurred' };
    }

    // If it's a known security error
    if (error.isSecurityRelated) {
      this.logSecurityEvent(error);
      return { 
        message: 'Access denied', 
        code: error.code || 'SECURITY_ERROR' 
      };
    }

    // Check for sensitive information in error messages
    const errorMessage = error.message || error.toString();
    
    if (this.containsSensitiveInfo(errorMessage)) {
      this.logSecurityEvent({
        type: 'sensitive_info_exposure',
        originalError: errorMessage,
        userAgent: navigator.userAgent,
      });
      
      return { 
        message: 'An error occurred while processing your request', 
        code: error.code || 'INTERNAL_ERROR' 
      };
    }

    // Rate limiting errors
    if (errorMessage.includes('Rate limit exceeded')) {
      return {
        message: errorMessage,
        code: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // Database/Supabase errors
    if (error.code && error.code.startsWith('PGRST')) {
      return {
        message: 'Database error occurred',
        code: 'DATABASE_ERROR'
      };
    }

    // Authentication errors
    if (error.code && (error.code === 'invalid_credentials' || error.code === 'email_not_confirmed')) {
      return {
        message: error.message,
        code: error.code
      };
    }

    // Network errors
    if (error.name === 'NetworkError' || errorMessage.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    }

    // In production, be more restrictive about error messages
    if (this.isProduction) {
      return {
        message: 'An error occurred while processing your request',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }

    // In development, show more details
    return {
      message: errorMessage,
      code: error.code
    };
  }

  private containsSensitiveInfo(message: string): boolean {
    return this.sensitivePatterns.some(pattern => pattern.test(message));
  }

  private logSecurityEvent(event: any): void {
    auditLogger.log({
      action: 'security_event',
      resource_type: 'error_handler',
      metadata: {
        event_type: event.type || 'error_sanitization',
        timestamp: new Date().toISOString(),
        ...event
      }
    });
  }

  public createSecurityError(message: string, code?: string, internalMessage?: string): SecurityError {
    const error = new Error(message) as SecurityError;
    error.code = code;
    error.isSecurityRelated = true;
    error.internalMessage = internalMessage;
    return error;
  }

  public handleAsyncError(fn: Function) {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        const sanitized = this.sanitizeError(error);
        throw new Error(sanitized.message);
      }
    };
  }
}

export const errorHandler = new ErrorHandler();

// Common security error types
export const SecurityErrors = {
  UNAUTHORIZED: () => errorHandler.createSecurityError(
    'Access denied', 
    'UNAUTHORIZED',
    'User attempted to access protected resource without proper authentication'
  ),
  
  INSUFFICIENT_PERMISSIONS: (resource?: string) => errorHandler.createSecurityError(
    'You do not have permission to access this resource',
    'INSUFFICIENT_PERMISSIONS',
    `User attempted to access ${resource || 'protected resource'} without proper role`
  ),
  
  INVALID_SESSION: () => errorHandler.createSecurityError(
    'Session expired. Please log in again.',
    'INVALID_SESSION',
    'User session is invalid or expired'
  ),
  
  RATE_LIMIT_EXCEEDED: (operation: string) => errorHandler.createSecurityError(
    'Too many attempts. Please try again later.',
    'RATE_LIMIT_EXCEEDED',
    `Rate limit exceeded for operation: ${operation}`
  ),
  
  SUSPICIOUS_ACTIVITY: () => errorHandler.createSecurityError(
    'Suspicious activity detected. Please contact support.',
    'SUSPICIOUS_ACTIVITY',
    'Potentially malicious activity detected'
  )
};