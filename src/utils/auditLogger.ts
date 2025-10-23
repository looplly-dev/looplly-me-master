import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  tenant_id?: string | null;
  user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
}

class AuditLogger {
  private queue: AuditLogEntry[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startFlushTimer();
  }

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, 'ip_address' | 'user_agent'>): Promise<void> {
    const enhancedEntry: AuditLogEntry = {
      ...entry,
      user_agent: navigator.userAgent,
      ip_address: null, // IP will be captured server-side if needed
    };

    this.queue.push(enhancedEntry);

    // For critical actions, flush immediately
    const criticalActions = ['user.delete', 'badge.award', 'balance.adjust', 'redemption.approve'];
    if (criticalActions.includes(entry.action)) {
      await this.flush();
    }
  }

  /**
   * Flush queued logs to database
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // Note: audit_logs table will be created by Phase 1 migration
      // Types will be auto-generated after migration runs
      const { error } = await (supabase as any)
        .from('audit_logs')
        .insert(batch);

      if (error) {
        console.error('Failed to flush audit logs:', error);
        // Re-queue failed items
        this.queue.push(...batch);
      }
    } catch (error) {
      console.error('Error flushing audit logs:', error);
      // Re-queue failed items
      this.queue.push(...batch);
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop flush timer and perform final flush
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

// Helper functions for common audit actions
export const auditActions = {
  login: (userId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'auth.login',
      resource_type: 'user',
      resource_id: userId,
      metadata,
    }),

  logout: (userId: string) =>
    auditLogger.log({
      user_id: userId,
      action: 'auth.logout',
      resource_type: 'user',
      resource_id: userId,
    }),

  dataAccess: (userId: string, resourceType: string, resourceId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: `${resourceType}.view`,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    }),

  dataModify: (userId: string, action: string, resourceType: string, resourceId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: `${resourceType}.${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    }),

  balanceAdjust: (adminUserId: string, targetUserId: string, amount: number, reason: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'balance.adjust',
      resource_type: 'user',
      resource_id: targetUserId,
      metadata: { amount, reason },
    }),

  badgeAward: (adminUserId: string, targetUserId: string, badgeId: string, badgeName: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'badge.award',
      resource_type: 'badge',
      resource_id: badgeId,
      metadata: { targetUserId, badgeName },
    }),

  roleChange: (adminUserId: string, targetUserId: string, oldRole: string, newRole: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'role.change',
      resource_type: 'user',
      resource_id: targetUserId,
      metadata: { oldRole, newRole },
    }),

  badgeGenerate: (userId: string, badgeName: string, tier: string, category: string) =>
    auditLogger.log({
      user_id: userId,
      action: 'badge.generate',
      resource_type: 'badge',
      metadata: { badgeName, tier, category },
    }),

  countryBlock: (adminUserId: string, countryCode: string, countryName: string, reason: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'country.block',
      resource_type: 'country_blocklist',
      resource_id: countryCode,
      metadata: { 
        country_name: countryName,
        reason,
        action_type: 'block'
      },
    }),

  countryUnblock: (adminUserId: string, countryCode: string, countryName: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'country.unblock',
      resource_type: 'country_blocklist',
      resource_id: countryCode,
      metadata: { 
        country_name: countryName,
        action_type: 'unblock'
      },
    }),

  countryReasonUpdate: (adminUserId: string, countryCode: string, countryName: string, oldReason: string, newReason: string) =>
    auditLogger.log({
      user_id: adminUserId,
      action: 'country.update_reason',
      resource_type: 'country_blocklist',
      resource_id: countryCode,
      metadata: { 
        country_name: countryName,
        old_reason: oldReason,
        new_reason: newReason,
        action_type: 'update_reason'
      },
    }),
};
