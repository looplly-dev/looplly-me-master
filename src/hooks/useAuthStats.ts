import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuthStats {
  successCount: number;
  failedCount: number;
  activeSessionsCount: number;
  errorCount: number;
  successRate: number;
}

export function useAuthStats(timeRange: '1h' | '24h' | '7d' = '24h', portal: 'user' | 'admin' | 'all' = 'all') {
  return useQuery({
    queryKey: ['auth-stats', timeRange, portal],
    queryFn: async (): Promise<AuthStats> => {
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      let successCount = 0;
      let failedCount = 0;
      let errorCount = 0;

      // Helper to detect portal
      const detectPortal = (username?: string): 'user' | 'admin' => {
        if (username?.includes('@looplly.mobile')) {
          return 'user';
        }
        return 'admin';
      };

      // 1. Count from Supabase auth logs
      try {
        const authLogsData = (window as any).__AUTH_LOGS__;
        if (authLogsData && Array.isArray(authLogsData)) {
          authLogsData.forEach((logEntry: any) => {
            try {
              const eventData = typeof logEntry.event_message === 'string' 
                ? JSON.parse(logEntry.event_message) 
                : logEntry.event_message;

              if (eventData.auth_event) {
                const logPortal = detectPortal(eventData.auth_event.actor_username);
                if (portal === 'all' || portal === logPortal) {
                  const logStatus = eventData.status || logEntry.status;
                  if (logStatus === 200 || logStatus === 204 || logStatus === '200' || logStatus === '204') {
                    if (eventData.auth_event.action === 'login') successCount++;
                  } else {
                    failedCount++;
                    errorCount++;
                  }
                }
              }
            } catch (parseError) {
              // Skip invalid entries
            }
          });
        }
      } catch (error) {
        console.error('Error processing auth logs for stats:', error);
      }

      // 2. Count from edge function logs
      try {
        const edgeFunctionLogsData = (window as any).__EDGE_FUNCTION_LOGS__;
        if (edgeFunctionLogsData && Array.isArray(edgeFunctionLogsData)) {
          edgeFunctionLogsData.forEach((logEntry: any) => {
            if (logEntry.event_message && typeof logEntry.event_message === 'string') {
              const loginMatch = logEntry.event_message.match(/Login (successful|failed) for: (\+\d+)/);
              
              if (loginMatch && (portal === 'all' || portal === 'user')) {
                if (loginMatch[1] === 'successful') {
                  successCount++;
                } else {
                  failedCount++;
                  errorCount++;
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error processing edge function logs for stats:', error);
      }

      // 3. Count from audit logs
      try {
        const { data: auditLogs, error } = await supabase
          .from('audit_logs')
          .select('action, metadata')
          .or('action.ilike.%auth%,action.ilike.%login%,action.ilike.%logout%')
          .gte('created_at', threshold);

        if (auditLogs && !error) {
          auditLogs.forEach((log) => {
            const action = log.action?.toLowerCase() || '';
            const metadata = log.metadata as Record<string, any> | null;
            const identifier = (metadata?.mobile as string) || (metadata?.email as string);
            const logPortal = detectPortal(identifier);
            
            if (portal === 'all' || portal === logPortal) {
              if (action.includes('login') || action.includes('success')) {
                successCount++;
              } else if (action.includes('error') || action.includes('failed')) {
                failedCount++;
                errorCount++;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching audit logs for stats:', error);
      }

      // Fetch active sessions count (simplified)
      const { count: activeSessionsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      const total = successCount + failedCount;
      const successRate = total > 0 ? (successCount / total) * 100 : 0;

      return {
        successCount,
        failedCount,
        activeSessionsCount: activeSessionsCount || 0,
        errorCount,
        successRate: Math.round(successRate),
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
