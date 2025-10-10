import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';

export interface AuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const [isLogging, setIsLogging] = useState(false);
  const { tenant } = useTenant();

  const logEvent = async (entry: AuditLogEntry) => {
    try {
      setIsLogging(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log audit event: no authenticated user');
        return;
      }

      const { error } = await supabase.rpc('log_audit_event', {
        p_tenant_id: tenant?.id || null,
        p_user_id: user.id,
        p_action: entry.action,
        p_resource_type: entry.resource_type || null,
        p_resource_id: entry.resource_id || null,
        p_metadata: entry.metadata || {},
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error logging audit event:', err);
    } finally {
      setIsLogging(false);
    }
  };

  // Convenience methods for common actions
  const logLogin = () => logEvent({ action: 'user.login' });
  
  const logLogout = () => logEvent({ action: 'user.logout' });
  
  const logDataAccess = (resourceType: string, resourceId: string) =>
    logEvent({ 
      action: 'data.access', 
      resource_type: resourceType, 
      resource_id: resourceId 
    });
  
  const logDataModification = (resourceType: string, resourceId: string, metadata?: Record<string, any>) =>
    logEvent({ 
      action: 'data.modify', 
      resource_type: resourceType, 
      resource_id: resourceId,
      metadata 
    });

  const logBadgeAward = (userId: string, badgeId: string) =>
    logEvent({ 
      action: 'badge.award', 
      resource_type: 'badge', 
      resource_id: badgeId,
      metadata: { awarded_to: userId }
    });

  return {
    isLogging,
    logEvent,
    logLogin,
    logLogout,
    logDataAccess,
    logDataModification,
    logBadgeAward,
  };
}
