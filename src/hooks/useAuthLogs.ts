import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuthLogEntry {
  id: string;
  timestamp: number;
  event_type: 'login' | 'logout' | 'register' | 'token' | 'error';
  status: 'success' | 'failed' | 'pending';
  user_identifier?: string;
  method?: string;
  duration_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
  source: 'supabase' | 'edge_function' | 'audit' | 'database';
  raw_data?: any;
}

export type TimeRange = '1h' | '24h' | '7d' | 'custom';

interface UseAuthLogsOptions {
  timeRange?: TimeRange;
  eventType?: string;
  userId?: string;
  status?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAuthLogs(options: UseAuthLogsOptions = {}) {
  const {
    timeRange = '24h',
    eventType,
    userId,
    status,
    autoRefresh = true,
    refreshInterval = 10000,
  } = options;

  return useQuery({
    queryKey: ['auth-logs', timeRange, eventType, userId, status],
    queryFn: async () => {
      const logs: AuthLogEntry[] = [];

      // Calculate time threshold
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24;
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      // Note: Supabase auth logs would require analytics API access
      // For now, we'll rely on audit logs which are accessible

      // Fetch audit logs
      try {
        const { data: auditLogs, error } = await supabase
          .from('audit_logs')
          .select('*')
          .or('action.ilike.%auth%,action.ilike.%login%,action.ilike.%logout%')
          .gte('created_at', threshold)
          .order('created_at', { ascending: false })
          .limit(100);

        if (auditLogs && !error) {
          auditLogs.forEach((log) => {
            const action = log.action?.toLowerCase() || '';
            const metadata = log.metadata as Record<string, any> | null;
            logs.push({
              id: log.id,
              timestamp: new Date(log.created_at).getTime(),
              event_type: action.includes('login') ? 'login' : action.includes('logout') ? 'logout' : 'token',
              status: 'success',
              user_identifier: (metadata?.mobile as string) || (metadata?.email as string),
              method: (metadata?.method as string) || 'unknown',
              metadata: metadata || undefined,
              source: 'audit',
              raw_data: log,
            });
          });
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }

      // Sort by timestamp descending
      logs.sort((a, b) => b.timestamp - a.timestamp);

      // Apply filters
      let filtered = logs;
      if (eventType) {
        filtered = filtered.filter(log => log.event_type === eventType);
      }
      if (userId) {
        filtered = filtered.filter(log => 
          log.user_identifier?.includes(userId) || 
          log.raw_data?.user_id === userId
        );
      }
      if (status) {
        filtered = filtered.filter(log => log.status === status);
      }

      return filtered;
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  });
}
