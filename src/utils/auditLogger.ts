import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

class AuditLogger {
  private logQueue: AuditLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Flush logs every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 30000);
  }

  public async log(entry: Omit<AuditLogEntry, 'ip_address' | 'user_agent'>): Promise<void> {
    try {
      const enhancedEntry: AuditLogEntry = {
        ...entry,
        user_agent: navigator.userAgent,
        // IP address would be set server-side in a real application
      };

      this.logQueue.push(enhancedEntry);

      // Flush immediately for critical actions
      if (this.isCriticalAction(entry.action)) {
        await this.flushLogs();
      }
    } catch (error) {
      console.error('Failed to queue audit log:', error);
    }
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'admin_login',
      'role_change',
      'user_deletion',
      'permission_grant',
      'permission_revoke',
      'sensitive_data_access',
    ];
    return criticalActions.includes(action);
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      // In a real application, you would send these to a secure audit log table
      // For now, we'll log them to console with a clear audit format
      logsToFlush.forEach(entry => {
        console.log('🔍 AUDIT LOG:', {
          timestamp: new Date().toISOString(),
          ...entry,
        });
      });

      // You could also store in local audit table if needed
      // await supabase.from('audit_logs').insert(logsToFlush);
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-queue failed logs
      this.logQueue.unshift(...logsToFlush);
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushLogs(); // Final flush
  }
}

export const auditLogger = new AuditLogger();

// Helper functions for common audit actions
export const auditActions = {
  login: (userId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'user_login',
      resource_type: 'authentication',
      metadata,
    }),

  logout: (userId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'user_logout',
      resource_type: 'authentication',
      metadata,
    }),

  adminLogin: (userId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'admin_login',
      resource_type: 'admin_access',
      metadata,
    }),

  dataAccess: (userId: string, resourceType: string, resourceId: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'data_access',
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    }),

  roleChange: (userId: string, targetUserId: string, newRole: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'role_change',
      resource_type: 'user_role',
      resource_id: targetUserId,
      metadata: { new_role: newRole, ...metadata },
    }),

  sensitiveOperation: (userId: string, operation: string, metadata?: Record<string, any>) =>
    auditLogger.log({
      user_id: userId,
      action: 'sensitive_operation',
      resource_type: 'system',
      metadata: { operation, ...metadata },
    }),
};