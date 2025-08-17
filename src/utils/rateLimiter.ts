interface RateLimitRule {
  maxAttempts: number;
  windowMs: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();

  constructor() {
    // Define rate limiting rules
    this.rules.set('login', { maxAttempts: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 minutes
    this.rules.set('registration', { maxAttempts: 3, windowMs: 60 * 60 * 1000 }); // 3 attempts per hour
    this.rules.set('password_reset', { maxAttempts: 3, windowMs: 60 * 60 * 1000 }); // 3 attempts per hour
    this.rules.set('admin_action', { maxAttempts: 10, windowMs: 60 * 60 * 1000 }); // 10 attempts per hour
    this.rules.set('api_call', { maxAttempts: 100, windowMs: 60 * 60 * 1000 }); // 100 calls per hour
  }

  private getKey(identifier: string, operation: string): string {
    return `${identifier}:${operation}`;
  }

  private cleanupOldAttempts(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      // Remove records older than 24 hours
      if (now - record.firstAttempt > 24 * 60 * 60 * 1000) {
        this.attempts.delete(key);
      }
    }
  }

  public isAllowed(identifier: string, operation: string): boolean {
    this.cleanupOldAttempts();
    
    const rule = this.rules.get(operation);
    if (!rule) {
      console.warn(`No rate limit rule defined for operation: ${operation}`);
      return true;
    }

    const key = this.getKey(identifier, operation);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return true;
    }

    // Check if the window has expired
    if (now - record.firstAttempt > rule.windowMs) {
      this.attempts.delete(key);
      return true;
    }

    // Check if limit exceeded
    return record.count < rule.maxAttempts;
  }

  public recordAttempt(identifier: string, operation: string): void {
    const key = this.getKey(identifier, operation);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      const rule = this.rules.get(operation);
      if (!rule) return;

      // Reset if window expired
      if (now - record.firstAttempt > rule.windowMs) {
        this.attempts.set(key, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now,
        });
      } else {
        record.count++;
        record.lastAttempt = now;
      }
    }
  }

  public getRemainingAttempts(identifier: string, operation: string): number {
    const rule = this.rules.get(operation);
    if (!rule) return -1;

    const key = this.getKey(identifier, operation);
    const record = this.attempts.get(key);

    if (!record) {
      return rule.maxAttempts;
    }

    const now = Date.now();
    if (now - record.firstAttempt > rule.windowMs) {
      return rule.maxAttempts;
    }

    return Math.max(0, rule.maxAttempts - record.count);
  }

  public getTimeUntilReset(identifier: string, operation: string): number {
    const rule = this.rules.get(operation);
    if (!rule) return 0;

    const key = this.getKey(identifier, operation);
    const record = this.attempts.get(key);

    if (!record) {
      return 0;
    }

    const now = Date.now();
    const timeRemaining = rule.windowMs - (now - record.firstAttempt);
    return Math.max(0, timeRemaining);
  }
}

export const rateLimiter = new RateLimiter();

export function withRateLimit<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const identifier = getUserIdentifier();
    
    if (!rateLimiter.isAllowed(identifier, operation)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(identifier, operation);
      const minutes = Math.ceil(timeUntilReset / (60 * 1000));
      throw new Error(`Rate limit exceeded. Try again in ${minutes} minutes.`);
    }

    rateLimiter.recordAttempt(identifier, operation);
    return fn(...args);
  };
}

function getUserIdentifier(): string {
  // Use IP address simulation + user agent for anonymous users
  // In a real app, you'd get the actual IP from the request
  return `${window.navigator.userAgent.slice(0, 50)}:${Date.now().toString().slice(-6)}`;
}